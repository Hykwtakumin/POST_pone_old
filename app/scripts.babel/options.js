
$(function () {
  $('#sendSettings').submit(function () {
    let clientID = uuid.v1();
      localStorage['clientID'] = clientID;
      localStorage['sendName'] = $('#sendName').val();
      console.log('settings confirmed!');
  });
});
