$(function () {
	var socket = io.connect('http://localhost:8000');

	socket.on('sessionID', function(data){
		$('#sessionID').html('sessionID : ' + data.sessionID);
	});

	$('#execute').click(function () {
		socket.emit('sendJS', { titre: $('#name').val(),DataSet: $('#DataSet').val(),
								Map: $('#Map').val(), Reduce: $('#Reduce').val() });
		
	});
	
	

	socket.on('broadcastJS', function (data) {
		alert('DRIIIIING');
		$('#getJS').click(function(){
			var result = eval(data.code);
			socket.emit('sendResult', {result: result, client: data.client});
			alert('Traitement effectué');
		});
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
