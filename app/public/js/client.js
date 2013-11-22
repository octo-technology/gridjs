$(function () {
	var socket = io.connect('http://localhost:8000');

	socket.on('sessionID', function(data){
		$('#sessionID').html('sessionID : ' + data.sessionID);
	});

	$('#execute').click(function () {
		socket.emit('sendJS', $('#jscode').val());
	});

	socket.on('broadcastJS', function (data) {
		$('#getJS').click(function(){
			var result = eval(data.code);
			socket.emit('sendResult', {result: result, client: data.client});
			alert('Traitement effectué');
		});
	});

	socket.on('hereIsTheResult', function(result){
		alert(result);
	});
});
