'use strict';

console.log('\'Allo \'Allo! Event Page');


chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var postedMessage = details.requestBody.formData.status.toString();
    console.log(postedMessage);

    chrome.storage.sync.set({'message': postedMessage}, function() {
      console.log('Message Posted!');
      new Notification('POST_pone', { tag: 'dev', body: '次のツイートを取り置きました\n' + postedMessage });
    });
    return {cancel: true};
  },
  {urls: ['*://twitter.com/i/tweet/create*']},
  ['requestBody','blocking']);
