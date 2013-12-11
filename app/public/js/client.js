$(function () {
	// Connection to Socket.IO
	var socket = io.connect('http://localhost:8000');


	// Listeners
		// UI
	socket.on('sessionID', displaySessionID);
	socket.on('nbUsers', displayUsers);
	socket.on('newProject', updateProjectsList);
	socket.on('hereIsTheResult', displayResult);
		// Calculations
	socket.on('sendChunk', doTheMaths);


	// Actionners 
	$('#execute').click(function() {
		socket.emit('sendJS', { titre: $('#name').val(), dataSet: $('#DataSet').val(), map: $('#Map').val(), reduce: $('#Reduce').val() });
	});
});


var displaySessionID = function(data){
	$('#sessionID').text('sessionID : ' + data.sessionID);
};

var displayUsers = function(data){
	$('#nbUsers').text("Number of connected users: "+data);
};

var displayResult =  function(result){
	alert(result);
};

var updateProjectsList = function(data) {
	if(Object.keys(data).length > 0)
	{
		$.each(data, function(key, value){
			$(value).each(function(){
				$('#projects').append('<div class="project">'+this.titre+'</div>');
			});
		});
	}
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