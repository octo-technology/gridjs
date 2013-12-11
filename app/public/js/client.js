var sessionID;

$(function () {
	// Connection to Socket.IO
	var socket = io.connect('http://localhost:8000');

	// Listeners
		// UI
	socket.on('sessionID', displaySessionID);
	socket.on('nbUsers', displayUsers);
	socket.on('sendProjects', initProjectsList);
	socket.on('newProject', updateProjectsList);
	socket.on('hereIsTheResult', displayResult);
		// Calculations
	socket.on('sendChunk', doTheMaths);

	// Actionners 
	$('#execute').click(function(){
		socket.emit('sendProject', {'title': $('#name').val(), 'dataSet': $('#dataSet').val(), 'map': $('#map').val(), 'reduce': $('#reduce').val()});
	});
	$(document).delegate('.project', 'click', function(){
		socket.emit('getChunk', {'userID': sessionID, 'projectID': $(this).attr('projectID')});
	});
});



///////////////////////////////////////
// METHODS
///////////////////////////////////////
var displaySessionID = function(data){
	$('#sessionID').text('sessionID : ' + data.sessionID);
	sessionID = data.sessionID;
};

var displayUsers = function(data){
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
	this.emit('sendChunkResults', {'projectData': data, 'results': results});
};

var jsonLength = function(json){
    return Object.keys(json).length;
}