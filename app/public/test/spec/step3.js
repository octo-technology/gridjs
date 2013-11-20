describe("L'application", function(){
	it("envoie la fonction sur un autre browser", function(done){
		var emetteur = io.connect('http://localhost:8000');

		var textarea = $('#jscode');
		var exec = $('#execute');

		emetteur.emit = function(socket, data){
			expect(socket).to.be.equal('sendJS');
			expect(data).to.be.an('object');
			expect(data).to.include.keys('code');
			expect(data.code).to.be.equal('test');
			done();
		};	

        textarea.val('test');
        exec.trigger('click');
	});

	it("reçoit le code et l'exécute", function(){
		var emetteur = io.connect('http://localhost:8000');
		var getJS = $('#getJS');
		var hasBeenCalled = false;

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