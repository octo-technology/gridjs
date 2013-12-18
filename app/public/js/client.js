$(function () {
	var dnode = require('dnode');
	var shoe = require('shoe');
	var remote;

	var d = dnode({
		newProject: updateProjectsList,
		sendProjects: initProjectsList,
		sendClients: displayNbUsers
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
	    });
	});

	$(document).delegate('.project', 'click', function() {
	    remote.getChunk($(this).text(), gotChunk);
	});
});

///////////////////////////////////////
// METHODS
///////////////////////////////////////
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
	$('#projects').append('<div class="project" projectID="'+data.id+'">'+data.title+'</div>');
};

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

var jsonLength = function(json){
    return Object.keys(json).length;
}

var gotChunk = function (data, callback) {
	if(!data) return;
	console.log('calculating chunk', data);
	var res = doTheMaths(data);
	callback(res);
};