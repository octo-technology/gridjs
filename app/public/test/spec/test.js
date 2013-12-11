describe("L'application", function(){
	it("envoie la fonction sur un autre browser", function(done){
		var emetteur = io.connect('http://localhost:8000');

		var name = $('#name');
		var dataSet = $('#dataSet');
		var map = $('#map');
		var reduce = $('#reduce');
		var exec = $('#execute');

		emetteur.emit = function(socket, data){
			expect(socket).to.be.equal('sendProject');
			expect(data.title).to.be.a('string');
			expect(data.dataSet).to.be.a('string');
			expect(data.map).to.be.a('string');
			expect(data.reduce).to.be.a('string');
			expect(data.title).to.be.equal('test');
			expect(data.dataSet).to.be.equal('[1,2,3,4]');
			expect(data.map).to.be.equal('a*a');
			expect(data.reduce).to.be.equal('a+b');
			done();
		};	

        name.val('test');
        dataSet.val('[1,2,3,4]');
        map.val('a*a');
        reduce.val('a+b');
        exec.trigger('click');
	});
/*
	it("reçoit le code et l'exécute", function(done){
		var recepteur = io.connect('http://localhost:8000');
		var getJS = $('#getJS');

		var myTestFunction = function (param){
            expect(param).to.equal(8);
            done();
        };
        window.myTestFunction = myTestFunction;

		recepteur.on = function(socket, callback){
			callback({code: 'myTestFunction(8)'});
		};

		recepteur.on('test', function (data) {
			$('#getJS').click(function(){
				eval(data.code);
			});
		});

		getJS.trigger('click');
	}); */
});