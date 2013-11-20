var io = require('socket.io-client');
var expect = require('chai').expect;

describe('Le serveur', function(){
	it("distribue le code reçu d'un des clients", function(done){
		// give
		var emetteur = io.connect('http://localhost:8000');
		var recepteur = io.connect('http://localhost:8000', {'force new connection': true});
		// when
		emetteur.emit('sendJS', {code: '1+1'});
		// then
		recepteur.on('broadcastJS', function(data){
			expect(data.code).to.be.equal('1+1');
			done();
		});
	});
});