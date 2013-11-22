var http = require('http');
var express = require('express');
var socketIO = require('socket.io');
var parseCookie = require('connect').utils.parseSignedCookie;
var Session = require('connect').middleware.session.Session;


var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);
    io.set('log level', 0);
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
//listen on localhost:8000
server.listen(8000);

app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.errorHandler());
  app.use(express.cookieParser());
  app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
  app.use(express.static('public'));
});

// Socket IO Authentifier
io.set('authorization', function (data, accept) {
    if (data.headers.cookie) 
    {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie.substring(16,40);
        // save the session store to the data object 
        // (as required by the Session constructor)
        data.sessionStore = sessionStore;
    } 
    else 
       return accept('No cookie transmitted.', false);
    // accept the incoming connection
    accept(null, true);
});


var getRandInArray = function(array)
{
   return array[Math.floor(Math.random()*array.length)];
};

var getRandClient = function(clients, emitter)
{
    var emitterID = emitter.handshake.sessionID;
    var receiverID = emitterID;
    var clientsList = Object.keys(clients);
    if(clientsList.length > 1)
    {
        while(receiverID == emitterID)
           receiverID = getRandInArray(clientsList); 
    }

    return clients[receiverID];
};

var clients = {};

// Socket IO listener
io.sockets.on('connection', function(socket){
  var hs = socket.handshake;
  // Sauvegarde de tous les clients 
  clients[hs.sessionID] = socket;
  // Affichage de la session en cours
  socket.emit('sessionID', {sessionID: hs.sessionID});

  socket.on('sendJS', function(data){
    console.log(data);
    // Sélection d'un browser sur lequel envoyer le calcul
    var receiver = getRandClient(clients, socket);
    receiver.emit('broadcastJS', data);
  });
});

var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
  console.log("Node Server running on port " + port);
});