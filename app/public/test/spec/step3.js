var io = require('socket.io-client');
var expect = require('chai').expect;

describe("L'application", function(){
	// it("envoie la fonction sur un autre browser", function(){
	// 	var recepteur = io.connect('http://localhost:8000');

	// 	var textarea = $('#jscode');
	// 	var exec = $('#execute');
	// 	var getJS = $('#getJS');

	// 	var hasBeenCalled = false;

	// 	var myTestFunction = function (param){
 //            expect(param).to.equal(8);
 //            hasBeenCalled = true;
 //        };
 //        window.myTestFunction = myTestFunction;
 //        textarea.val('myTestFunction(8)');
 //        exec.trigger('click');

 //        recepteur.on('broadcastJS', function(){

 //        });
	// });

	it("reçoit le code et l'exécute", function(){
		var emetteur = io.connect('http://localhost:8000');

		var getJS = $('#getJS');

		var myTestFunction = function (param){
            expect(param).to.equal(8);
            hasBeenCalled = true;
        };
        window.myTestFunction = myTestFunction;

		emetteur.emit('sendJS', {code: 'myTestFunction(8)'});

		getJS.trigger('click');
		expect(hasBeenCalled).to.be.true;
	});
});