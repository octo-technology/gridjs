var remote;

$(function () {
	$('#dataSet').val("(function() {var tableau=[]; for (var i=1; i<1000;i++){tableau.push(i);};return tableau})()");
	$('#name').val('MégaTest');
	$('#map').val('a*a');
	$('#reduce').val('a+b');

	var dnode = require('dnode');
	var shoe = require('shoe');

	var d = dnode({
		newProject: addProjectToList,
		sendProjects: initProjectsList,
		sendClients: displayNbUsers,
		sendChunk: sendChunk
	});

	d.on('remote', function(r) {
		remote = r;
		var urlHash = location.hash;
		if (urlHash){
			sendChunk(urlHash.substring(1));
		}
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
			runProject(project.title);
	    });
	});

	$(document).delegate('.project', 'click', function() {
		runProject($(this).text());
	});
});

///////////////////////////////////////
// METHODS
///////////////////////////////////////
var runProject = function(title){
	$('#progressBars').append('<div class="project" name="'+title+'"></div>');
	var thisProject = $('#progressBars .project[name='+title+']');
		thisProject.append('<div class="name">'+title+' : <span class="progressNum">0</span>%</div>');
		thisProject.append('<div class="progress progress-striped active"><div class="progress-bar" role="progressbar"></div></div>');

	remote.onProjectComplete(title, function(result){
		scriptIsOver(title, result);
	});	

	sendChunk(title);
}

var displaySessionID = function(data){
	$('#sessionID').text('sessionID : ' + data.sessionID);
	sessionID = data.sessionID;
};

var displayNbUsers = function(data){
	$('#nbUsers').text("Utilisateurs connectés : "+data);
};

var displayResult =  function(result){
	alert(result);
};

var initProjectsList = function(data) {
	$('#projects').html('');
	if(jsonLength(data) > 0)
	{
		$.each(data, function(key, value){
			addProjectToList({'id': key, 'title': value.title});
		});
	}
};

var addProjectToList = function(data) {
	var projectID = $('#projects').length;
	$('#projects').append('<div class="btn btn-default btn-sm project" projectID="'+projectID+'">'+data.title+'</div>');
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

var scriptIsOver = function(title, result){
	var resultHTML = '<div class="alert alert-success">Résultat : '+result+'</div>';
	$('#progressBars .project[name='+title+']').html(resultHTML);
	$('#projects .project:contains('+title+')').remove();
}

var jsonLength = function(json){
    return Object.keys(json).length;
}

var gotChunk = function (data, returnResult) {
	if(!data) return;

	var thisProject = $('#progressBars .project[name='+data.projectID+']');
	thisProject.children('.name').children('.progressNum').html(Math.round(data.progress));
	thisProject.children('.progress').children('.progress-bar').css('width', data.progress+'%');

	setTimeout(function(){
		var res = doTheMaths(data);
		returnResult(res, function (err) {
      if(err) throw err;
      sendChunk(data.projectID);
    });
	}, 1000);
};
