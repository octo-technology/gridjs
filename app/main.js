var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);
//listen on localhost:8000
server.listen(8000);

app.configure(function () {
  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.errorHandler());
  app.use(app.router);
  app.use(express.static('public'));
});


var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
  console.log("Node Server running on port " + port);
});