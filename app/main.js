// Node Modules
var http = require('http'),
    express = require('express'),
    socketIO = require('socket.io'),
    parseCookie = require('connect').utils.parseSignedCookie,
    Session = require('connect').middleware.session.Session,
    vm = require('vm');

// Creating Express Server
var app = express(),
    server = http.createServer(app);
// Sockets Listener
var io = socketIO.listen(server);
    io.set('log level', 0);
// Session Storage
var MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();
// Listening on port 8000
var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
    console.log("Node Server running on port " + port);
});

// Server Configuration
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.errorHandler());
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
    app.use(express.static('public'));
});

// Socket Authentifier
io.set('authorization', function (data, accept){
    if(!data.headers.cookie)
        return accept('No cookie transmitted.', false);
        
    data.cookie = parseCookie(data.headers.cookie);
    data.sessionID = data.cookie.substring(16,40);
    // accept the incoming connection
    accept(null, true);
});

// App's Data
var clients = {};
var projects = {};

// Socket Connection Handling
io.sockets.on('connection', function(socket){
    var sessionID = getSessionID(socket);

    addClient(socket);
    socket.emit('sendProjects', projects);

    socket.on('sendProject', function(data){
        var newProjectID = addProject(data, sessionID);
        sendChunk({'projectID': newProjectID, 'userID': sessionID});
    });

    socket.on('getChunk', sendChunk);

    socket.on('sendChunkResults', function(data){
        var project = projects[data.projectData.projectID];
        var chunksList = project.chunks;
        var runningChunks = chunksList.runningChunks;
        var calculatedChunks = chunksList.calculatedChunks;
        for(var i in runningChunks)
        {
            var chunk = runningChunks[i];
            if(data.projectData.dataSet.compare(chunk))
            {
                console.log(i)
                var calculatedChunk = runningChunks.splice(i,1);
                calculatedChunks.push(calculatedChunk);
                break;
            }
        }
        project.results.push(data.results);
        console.log(project);
    })

    socket.on('sendResult', displayResult);
    socket.on('disconnect', disconnect);
});


///////////////////////////////////////
// METHODS
///////////////////////////////////////
var getRandInArray = function(array){
   return array[Math.floor(Math.random()*array.length)];
};

var getRandClient = function(clients, emitter){
    var emitterID = emitter.handshake.sessionID;
    var receiverID = emitterID;
    var clientsList = Object.keys(clients);
    console.log(clientsList)
    if(clientsList.length > 1)
    {
        while(receiverID == emitterID)
           receiverID = getRandInArray(clientsList); 
    }
    console.log(receiverID)
    return clients[receiverID];
};

var addClient = function(socket){
    var sessionID = getSessionID(socket);

    if(clients[sessionID]) return;

    clients[sessionID] = socket;
    socket.emit('sessionID', {'sessionID': sessionID});
    console.log('Connection : '+sessionID);
};

var getSessionID = function(socket){
    return socket.handshake.sessionID;
}

var addProject = function(data, ownerID){
    var dataSet = vm.runInNewContext(data.dataSet);
    if(!Array.isArray(dataSet))
        console.log('not an Array !'); // Cas d'erreur à traiter

    var chunkLength = 2;
    var chunks = [];
    while(dataSet.length > 0) 
        chunks.push(dataSet.splice(0,chunkLength));

    var projectID = new String(data.title).hashCode();

    var project = {};
        project.ownerID = ownerID;
        project.contributors = [];
        project.title = data.title;
        project.functions = {'map': data.map, 'reduce': data.reduce};
        project.chunks = {'availableChunks': chunks, 'runningChunks': [], 'calculatedChunks': []};
        project.results = [];

    io.sockets.emit('newProject', {'id': projectID, 'title': project.title});
    projects[projectID] = project;

    return projectID;
}

var sendChunk = function(data){
    var projectID = data.projectID;
    var userID = data.userID;
    
    var project = projects[projectID];
    console.log(project)
    var chunk = project.chunks.availableChunks.splice(0,1)[0];
    
    project.chunks.runningChunks.push(chunk);
    project.contributors.push(userID);

    clients[userID].emit('sendChunk', {'projectID': projectID, 'dataSet': chunk, 'map': project.functions.map});
};

var displayResult = function(data){
    clients[data.client].emit('hereIsTheResult', data.result);
}

var disconnect = function(){
    var sessionID = this.handshake.sessionID;
    delete clients[sessionID];
    console.log('Disconnection : '+sessionID);
    io.sockets.emit('nbUsers', Object.keys(clients).length);
}

var jsonLength = function(json){
    return Object.keys(json).length;
}

String.prototype.hashCode = function(){
    if (Array.prototype.reduce){
        return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
    } 
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}