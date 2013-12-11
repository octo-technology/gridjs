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

	it("ajoute le projet à la liste des projets en cours", function(done){
		var recepteur = io.connect('http://localhost:8000');

		var myTestFunction = function (data){
			expect(data.id).to.be.a('string');
			expect(data.title).to.be.a('string');
			expect(data.id).to.be.equal('007');
			expect(data.title).to.be.equal('test');
			$('#projects').append('<div class="project" "projectID"='+data.id+'>'+data.title+'</div>');
            done();
        };
        window.myTestFunction = myTestFunction;

		recepteur.on = function(socket, callback){
			callback({'id': '007', 'title': 'test'});
		};

		recepteur.on('newProject', function(data){
			$('#getJS').click(function(){
				myTestFunction(data);
			});
		});

		$('#getJS').trigger('click');
	});
});