var http = require('http');
var express = require('express');
var socketIO = require('socket.io');
var vm = require('vm');

var app = express();
var server = http.createServer(app);
var io = socketIO.listen(server);
io.set('log level', 0);
//listen on localhost:8000
server.listen(8000);

app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.static('public'));
  app.use(express.bodyParser());
});


// Socket IO listener
io.sockets.on('connection', function (socket) {
  socket.on('sendJS', function (data) {
    console.log(data);
    socket.broadcast.emit('broadcastJS', data);
  });
});

var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
  console.log("Node Server running on port " + port);
});