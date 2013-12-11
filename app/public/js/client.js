$(function () {
	// Connection to Socket.IO
	var socket = io.connect('http://localhost:8000');

	var sessionID;

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
	$('#execute').click(function() {
		socket.emit('sendProject', {title: $('#name').val(), dataSet: $('#DataSet').val(), map: $('#Map').val(), reduce: $('#Reduce').val()});
	});

	$('#project').click(function() {
		socket.emit('getChunk', { idUser: sessionID, idProject: projectID });
	})
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
	if(Object.keys(data).length > 0)
	{
		$.each(data, function(key, value){
			$(value).each(function(){
				$('#projects').append('<div class="project" "projectID"='+this.id+'>'+this.titre+'</div>');
			});
		});
	}
};

var updateProjectsList = function(data) {
	$('#projects').append('<div class="project" "projectID"='+data.id+'>'+data.titre+'</div>');
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
	socket.emit('sendChunkResults', {'owner': data.owner, 'results': results});
};