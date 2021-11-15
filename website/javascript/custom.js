$(document).ready(function(){
  var redirect_from = localStorage.getItem('redirect_from');
  if(redirect_from){
    $('.login-modal').trigger('click');
    localStorage.removeItem('redirect_from');
  }
  setTimeout(function(){
    $('.cth-modal').trigger('click');
  }, 1000);
  $('.open-tab').click(function(){
    $(this).tab('show')
  });
  $('.open-chat').click(function(){
    window.fcWidget.open();
  });
})
