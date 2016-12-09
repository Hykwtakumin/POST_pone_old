window.onload = function() {
  const form = document.forms.sendSettings;
  let button = document.getElementById('button');
  console.log('settings confirmed!');
// alert('査読者を設定しました!');
  // 背景色を赤くするイベント
  button.addEventListener('click', function() {
    localStorage['sendName'] = form.sendName.value;
    console.log(localStorage['sendName']);
    new Notification('POST_pone', { tag: 'dev', body: '次の人にTweetを見てもらいます。\n' +'@' + localStorage['sendName'] + 'さん'});
  }, false);
};