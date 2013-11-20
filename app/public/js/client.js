require(['/js/dnode.js'], function (dnode) {
	var client = {};
	client.sayAnotherMessage = function(message) {
	    document.write(message);
	};

	dnode(client).connect(function (server) {
	    server.sayHello(function (message) {
	        document.write(message);
	    });
	});
});