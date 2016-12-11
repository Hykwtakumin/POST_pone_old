'use strict';

let socket = io('http://localhost:3000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

let isoverlapped;

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
  let clientID = uuid.v4();
  localStorage['clientID'] = clientID;
  console.log('your ClientID=', localStorage['clientID']);
});

// chrome.alarms.create('reqTweet', { periodInMinutes: 1 });

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    localStorage['repUUID'] = uuid.v1();
    localStorage['repComment'] = '';
    localStorage['isOK'] = false;
    localStorage['authToken'] = details.requestBody.formData.authenticity_token.toString();

    // let repID = turlarray[5];
    if(details.requestBody.formData.status.toString() !== localStorage['repTW']){
      localStorage['repTW'] = details.requestBody.formData.status.toString();
      isoverlapped = false;
    }else{
      isoverlapped =true;
      console.log('重複が存在します');
    }
    localStorage['in_reply_to_status_id'] = details.requestBody.formData.in_reply_to_status_id.toString();
    // console.log('sendBody=' + details.requestBody.requestBody.formData.toString());
      return {cancel: false};
  },
  {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*','https://api.twitter.com/1.1/statuses/update.json']},
  ['requestBody','blocking']);

  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details){
      // localStorage['localHeader'] = details.requestHeaders ;
      localStorage['repURL'] = details.requestHeaders[6].value;
      console.log(localStorage['repURL']);

      if(localStorage['repTW'].indexOf('@') !== -1){
          requestReview();
        return {cancel: true};
      }else{
        return {cancel: false};
      }
    },
    {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*','https://api.twitter.com/1.1/statuses/update.json']},
    ['requestHeaders','blocking']);


const requestReview = () =>{

  if (isoverlapped != true){
    new Notification('POST_pone', { tag: 'dev', body: '次のツイートが取り置かれました\n' + localStorage['repTW'] });
    socket.emit('post_tweet',{
      clientID: localStorage['clientID'],
      authToken:  localStorage['authToken'],
      repUUID: localStorage['repUUID'],
      in_reply_to_status_id: localStorage['in_reply_to_status_id'],
      repTW: localStorage['repTW'],
      repComment: '',
      repURL: localStorage['repURL'],
      sendPerson: '',
      isOK: false
    }, function onack(response){
      console.log(response);
      if(response.confirm_result){
        new Notification('POST_pone', { tag: 'dev', body: '投稿が承認されました!'});
      }else{
        new Notification('POST_pone', { tag: 'dev', body: '査読結果が出ました。\n' + response.draft_Text });
      }
    });
  }else{
    console.log('重複が存在するので送信しませんでした');
  }
};

socket.on('confirm_tweet', function (data) {
  console.log('tweet confirmed!');
  console.log(data);
  return {cancel: false};
});

socket.on('resend_tweet', function (data) {
  console.log('tweet confirmed!');
  new Notification('POST_pone', { tag: 'dev', body: '査読結果が来ました。\n' + data.draft_Text });
});

