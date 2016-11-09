'use strict';

console.log('\'Allo \'Allo! Event Page');


chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var postedMessage = details.requestBody.formData.status.toString();
    var repID = details.requestBody.formData.in_reply_to_status_id.toString();
    var repToken = details.requestBody.formData.authenticity_token.toString();
    console.log(postedMessage);
    console.log(repID);

    new Notification('POST_pone', { tag: 'dev', body: '次のツイートを取り置きました\n' + postedMessage });
    getTweetData(repID, postedMessage);
    return {cancel: true};
  },
  {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*']},
  ['requestBody','blocking']);

function getTweetData(repID, postedMessage) {

  var purl = 'http://localhost:3000/api/posttweet';

  fetch(purl, {
    method: 'POST',
    // mode: 'cors',
    body: new FormData(
      FormData.append('repID', repID),
      FormData.append('ptweets', postedMessage),
      // FormData.append('reptoken', repToken)
    )
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    console.log(json);
  });
}