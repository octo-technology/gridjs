// Node Modules
var http = require('http'),
    express = require('express'),
    vm = require('vm'),
    shoe = require('shoe'),
    dnode = require('dnode');

var pif= 0;

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
var projectsOver = {};
var clients = [];

var shoeServer = shoe(function (stream) {
  var remote;
  var d = dnode({
    createProject: createProject,
    getChunk: getChunk
  });
  d.on('remote', addClient);
  d.on('end', disconnect);
  d.pipe(stream).pipe(d);
});

shoeServer.install(server, '/shoe');

///////////////////////////////////////
// METHODS
///////////////////////////////////////
var broadcast = function(theseClients, callback, params){
    theseClients.forEach(function (client) {
        client[callback](params);
    });
};

var addClient = function(r) {
    remote = r;
    clients.push(remote);
    remote.sendProjects(projects);
    remote.idRem = pif;
    pif++;
    broadcast(clients, 'sendClients', clients.length);
};

var addProject = function(data, ownerID){
    console.log('data', data);
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
        project.chunks = {'available': chunks, 'running': [], 'calculated': []};
        project.results = [];

    projects[projectID] = project;
}

var createProject = function (project, callback) {
    addProject(project);
    callback();
    broadcast(clients, 'newProject', project);
}

var getChunk = function (projectName, calculate) {
    var project = projects[projectName];
    var chunks = project.chunks;
    var progress = chunks.calculated.length / (chunks.available.length + chunks.running.length + chunks.calculated.length) * 100;
    var chunk = chunks.available.shift();
    if(!chunk) return calculate();
    if(project.contributors.indexOf(remote) == -1)
    {
        project.contributors.push(remote);
    }    
    chunks.running.push(chunk);
    var data = {
        'projectID': projectName,
        'dataSet': chunk,
        'map': project.functions.map,
        'progress': progress
    }
    remote.runningData = data;
    calculate(data, function (result) {
        console.log('result for', chunk, 'is', result);
        var calculated = result;
        var original = chunk;
        var chunks = project.chunks;
        var reductedResult = reduceThis(project.functions.reduce, calculated);
        project.results.push(reductedResult);
        chunks.calculated.push(original);
        var i = chunks.running.indexOf(original);
        chunks.running.splice(i, 1);
        if(chunks.running.length == 0 && chunks.available.length == 0)
        {
            var finalResult = reduceThis(project.functions.reduce, project.results);
            console.log('Résultat: '+finalResult);
            var contributors = project.contributors;
            broadcast(contributors, 'scriptIsOver', {'result': finalResult, 'project': projectName});
            projectsOver[projectName] = project;
            delete projects[projectName];
            delete remote.runningData;
        }
        else
        {
            console.log(remote.idRem)
            remote.sendChunk(projectName);
        }
        
    });
}

var disconnect = function(){
    var idRemote = clients.indexOf(remote);
    clients.splice(idRemote, 1);    
    broadcast(clients, 'sendClients', clients.length);

    if(!remote.runningData) return;
    var chunkAvorted = remote.runningData;
    var project = projects[chunkAvorted.projectID];
    var chunks = project.chunks;
    var i = chunks.running.indexOf(chunkAvorted);
    chunks.running.splice(i, 1);
    chunks.available.unshift(chunkAvorted.dataSet);
    console.log(chunks);
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