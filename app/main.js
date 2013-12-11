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
    addClient(socket);
    
    // Send current projects
    var currentProjects = projects[socket.handshake.sessionID];
    if(!currentProjects)
        currentProjects = [];
    socket.emit('sendProjects', projects);

    socket.on('sendJS', function(data){
        addProject(data, socket);
    });

    socket.on('sendChunkResults', function(data){
        console.log(data)
    })

    socket.on('sendResult', displayResult);
    socket.on('disconnect', disconnect);
});


///////////////////////////////////////
// USEFUL METHODS
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

var displayProjects = function(){
    io.sockets.emit('newProject', projects);
}; 

var addProject = function(data, socket){
    var currentProjects = projects[socket.handshake.sessionID];
    if(!currentProjects)
        currentProjects = [];
    currentProjects.push(data);

    io.sockets.emit('newProject', data);

    var dataSet = vm.runInNewContext(data.dataSet),
        map = data.map,
        reduce = data.reduce;

    var dataSetLength = dataSet.length;
    var chunkLength = dataSetLength/jsonLength(clients);
    var counter = 0;

    for(var id in clients)
    {
        var clientSocket = clients[id];
        var chunkDataSet = dataSet.slice(counter, counter+chunkLength);
        console.log('counter:'+counter);
        console.log('dataSet:'+chunkDataSet)
        clientSocket.emit('sendChunk', {'owner': socket.handshake.sessionID, 'dataSet': chunkDataSet, 'map': map});
        counter += chunkLength;
    };       
}

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