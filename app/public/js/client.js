$(function () {
	var socket = io.connect('http://localhost:8000');

	$('#execute').click(function () {
		socket.emit('sendJS', {code: $('#jscode').val()});
	});

	socket.on('sessionID', function(data){
		$('#sessionID').html('sessionID : ' + data.sessionID);
	});

	socket.on('broadcastJS', function (data) {
		$('#getJS').click(function(){
			eval(data.code);
		});
	});
});
