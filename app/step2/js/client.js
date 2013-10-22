$(function () {
  var answer = $('.answer');
  $('#execute').click(function () {
    var code = $('#jscode').val();
    $.ajax({
		url: '/postCode',
		type: 'POST',
		data: {'code': code},
		success: function(data){
			alert(data);
		},
		error: function(err){
			console.log(err);
		}
	});
  });
});
