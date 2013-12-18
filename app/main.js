
// Node Modules
var http = require('http'),
    express = require('express'),
    vm = require('vm'),
    shoe = require('shoe'),
    dnode = require('dnode');

// Creating Express Server
var app = express(),
    server = http.createServer(app);
// Listening on port 8000
var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function (){
    console.log("Node Server running on port " + port);
});

// Server Configuration
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.errorHandler());
    app.use(express.static('public'));
});

// App's Data
var projects = {};
var clients = [];

var shoeServer = shoe(function (stream) {
  var remote;
  var d = dnode({
    createProject: function (project, callback) {
      addProject(project);
      console.log('projects', Object.keys(projects));
      callback();
      clients.forEach(function (client) {
        client.newProject(project);
      });
    },
    getChunk: function (projectName, calculate) {
      var project = projects[projectName];
      var chunk = project.chunks.availableChunks.shift();
      if(!chunk) return calculate();
      project.contributors.push(remote);
      project.chunks.runningChunks.push(chunk);
      var data = {
        'projectID': projectName,
        'dataSet': chunk,
        'map': project.functions.map
      }
      calculate(data, function (result) {
        console.log('result for', chunk, 'is', result);
        var calculated = result;
        var original = chunk;
        var reductedResult = reduceThis(project.functions.reduce, calculated);
        console.log(reductedResult)
        project.results.push(reductedResult);
        project.chunks.calculatedChunks.push(original);
        var i = project.chunks.runningChunks.indexOf(original);
        project.chunks.runningChunks.splice(i, 1);
        console.log('project updated', project);
      });
    }
  })
  d.on('remote', function(r) {
    remote = r;
    clients.push(remote);
    remote.sendProjects(projects);
    broadcast('sendClients', clients.length);
  });
  d.on('end', function(){
    var idRemote = clients.indexOf(remote);
    clients.splice(idRemote, 1);
    broadcast('sendClients', clients.length);
  });
  d.pipe(stream).pipe(d);
});

shoeServer.install(server, '/shoe');

///////////////////////////////////////
// METHODS
///////////////////////////////////////
var broadcast = function(callback, params){
    clients.forEach(function (client) {
        client[callback](params);
    });
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

    var projectID = data.title;

    var project = {};
        project.ownerID = ownerID;
        project.contributors = [];
        project.title = data.title;
        project.functions = {'map': data.map, 'reduce': data.reduce};
        project.chunks = {'availableChunks': chunks, 'runningChunks': [], 'calculatedChunks': []};
        project.results = [];

    projects[projectID] = project;
}

var sendChunk = function(data){
    var projectID = data.projectID;
    var userID = data.userID;
    
    var project = projects[projectID];
    console.log(project)
    var chunk = project.chunks.availableChunks.shift();
    
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

var reduceThis = function(fn, results){
    if(results.length == 1) return results[0];

    var a = results.shift();
    var b = results.shift();
    var reducted = eval(fn);

    results.unshift(reducted);
    return reduceThis(fn, results);
}