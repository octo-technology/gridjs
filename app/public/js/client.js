var client = {};
client.sayAnotherMessage = function(message) {
    document.write(message);
};

DNode(client).connect(function(server) {
    server.sayHello(function (message) {
        document.write(message);
    });
});