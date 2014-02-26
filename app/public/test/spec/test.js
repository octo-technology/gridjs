describe("L'application", function(){
	it("envoie la fonction sur un autre browser", function(done){


		var name = $('#name');
		var dataSet = $('#dataSet');
		var map = $('#map');
		var reduce = $('#reduce');
		var exec = $('#execute');

		remote.createProject = function(data, callback){
			expect(data).to.be.equal('sendProject');
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

	it("ajoute le projet à la liste des projets en cours", function(){
		var projectsList = $('#projects .project');
		var projectHTML = projectsList.html();
		var projectID = projectsList.attr('projectID');

		expect(projectsList).to.have.length(1);
		expect(projectHTML).to.be.equal('test');
		expect(projectID).to.be.equal('3556498');
	});

	it("envoie une demande de calcul si on clique sur un projet", function(done){
		var emetteur = io.connect('http://localhost:8000');
		var projectsList = $('#projects .project');

		emetteur.emit = function(socket, data){
			expect(socket).to.be.equal('getChunk');
			expect(data.userID).to.be.equal(sessionID);
			expect(data.projectID).to.be.equal('3556498');
			done();
		};	

		projectsList.click();
	});	
});