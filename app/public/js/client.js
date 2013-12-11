$(function () {
	var socket = io.connect('http://localhost:8000');

	socket.on('sessionID', function(data){
		$('#sessionID').html('sessionID : ' + data.sessionID);
	});

	$('#execute').click(function () {
		socket.emit('sendJS', { titre: $('#name').val(), dataSet: $('#DataSet').val(),
								map: $('#Map').val(), reduce: $('#Reduce').val() });
	});
	
	

	socket.on('sendChunk', function(data){
		console.log(data);
		var results = [];
		for(var index in data.dataSet)
		{
			var a = data.dataSet[index];
			var result = eval(data.map);
			results.push(result);
		}
		socket.emit('sendChunkResults', {'owner': data.owner, 'results': results});
	});

	socket.on('nbUsers', function (data) {
		$('#nbUsers').text("Number of connected users: "+data);
	});

	socket.on('newProject', function (data) {
		if(Object.keys(data).length > 0)
		{
			$.each(data, function(key, value){
				$(value).each(function(){
					$('#projects').append('<div class="project">'+this.titre+'</div>');
				});
			});
		}
	});

	socket.on('hereIsTheResult', function(result){
		alert(result);
	});
});
