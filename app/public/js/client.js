$(function () {
	var socket = io.connect('http://localhost:8000');

	$('#execute').click(function () {
		socket.emit('sendJS', {code: $('#jscode').val()});
	});

	socket.on('execJS', function (data) {
		console.log(data);
		eval(data.code);
	});
});
