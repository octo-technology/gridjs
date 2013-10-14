$(function () {
  var answer = $('.answer');
  $('#execute').click(function () {
    var code = $('#jscode').val();
    var write = function (result) {
      answer.html(result)
    };
    eval(code);
  });
});
