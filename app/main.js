var express = require('express');

var server = express();

server.configure(function () {
  server.use(express.logger());
  server.use(express.static('public'));
  server.use(express.bodyParser());
});

server.post('/postCode', function(req, res){
  var code = req.body.code;
  var result = eval(code);
  res.end(String(result));
});

var port = (process.env.PORT ? process.env.PORT : 8000);
server.listen(port).listen(function () {
  console.log("Node Server running on port " + port);
});

