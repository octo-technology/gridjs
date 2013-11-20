var http = require('http');
var express = require('express');
var dnode = require('dnode');

var app = express();
var server = http.createServer(app);

app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.errorHandler());
  app.use(app.router);
  app.use(express.static('public'));
});

dnode(function (client) {
    this.sayHello = function (callback) {
        callback('Hello from Node land');
        client.sayAnotherMessage('enjoy your day');
    };
}).listen(server);

var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
  console.log("Node Server running on port " + port);
});