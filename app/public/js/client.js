var remote;

$(function () {
	var dnode = require('dnode');
	var shoe = require('shoe');

	var d = dnode({
		newProject: updateProjectsList,
		sendProjects: initProjectsList,
		sendClients: displayNbUsers,
		sendChunk: sendChunk,
		scriptIsOver: scriptIsOver
	});

	d.on('remote', function(r) {
		remote = r;
	});

	d.pipe(shoe('shoe')).pipe(d);

	$('#execute').click(function(){
	    var project = {
			'title': $('#name').val(),
			'dataSet': $('#dataSet').val(),
			'map': $('#map').val(),
			'reduce': $('#reduce').val()
	    };
		remote.createProject(project, function () {
			remote.getChunk(project.title, gotChunk);
			runProject(project.title);
	    });
	});

	$(document).delegate('.project', 'click', function() {
		sendChunk($(this).text());
		runProject(project.title);
	});
});

///////////////////////////////////////
// METHODS
///////////////////////////////////////
var runProject = function(title){
	$('#projectName').html('Projet en cours : '+title);
	$('#projectData .progress').show();
}

var displaySessionID = function(data){
	$('#sessionID').text('sessionID : ' + data.sessionID);
	sessionID = data.sessionID;
};

var displayNbUsers = function(data){
	$('#nbUsers').text("Number of connected users: "+data);
};

var displayResult =  function(result){
	alert(result);
};

var initProjectsList = function(data) {
	if(jsonLength(data) > 0)
	{
		$.each(data, function(key, value){
			updateProjectsList({'id': key, 'title': value.title});
		});
	}
};

var updateProjectsList = function(data) {
	var projectID = $('#projects').length;
	$('#projects').append('<div class="project" projectID="'+projectID+'">'+data.title+'</div>');
};

var sendChunk = function(projectName) {
	remote.getChunk(projectName, gotChunk);
}

var doTheMaths = function(data){
	console.log(data);
	var results = [];
	for(var index in data.dataSet)
	{
		var a = data.dataSet[index];
		var result = eval(data.map);
		results.push(result);
	}
	return results;
}

var scriptIsOver = function(data){
	var result = data.result;
	var project = data.project;
	console.log('Résultat :', result);
	$('#projects .project:contains('+project+')').remove();
}

var jsonLength = function(json){
    return Object.keys(json).length;
}

var gotChunk = function (data, callback) {
	if(!data) return;
	console.log('calculating chunk', data);
	var res = doTheMaths(data);
	callback(res);
};