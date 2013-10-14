$(function () {
  $('#execute').click(function () {
    var code = $('#jscode').val();
    eval(code);
  });
});
