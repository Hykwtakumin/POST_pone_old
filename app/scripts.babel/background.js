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
    // console.log(details.requestBody.formData.values());
    // let parsedDetails = JSON.stringify(details);
    //   console.log(parsedDetails);
    // if (parsedDetails.indexOf('in_reply_to_status_id') !== 1){
    //   console.log(parsedDetails['status']);
    // }
    // let repURL = details.url;
    // let repURLarray = repURL.split('/');
    // console.log(repURL);

    // localStorage['localBody'] = details.requestBody;
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
        // chrome.runtime.sendMessage( response.draft_Text, function(response){
        //   console.log('Message sended!'+ response);
        //   confirm_result = true;
        // });
        // return {cancel: true};
        // confirm_result = true;
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


// const postTweet = (clientID,authToken,repID,repTW,repUUID,repComment,repURL,isOK) =>{
//     console.log(repID.toString(),repTW.toString());
//   let pURL = 'http://localhost:3000/api/tweets';
//   let postData = {
//                   'clientID': clientID
//                   ,'repUUID': repUUID
//                   ,'authToken':authToken
//                   , 'repID':repID
//                   , 'repTW':repTW
//                   , 'repComment':repComment
//                   , 'repURL':repURL
//                   , 'isOK' :isOK
//   };
//   $.post(pURL, postData, function(data){
//     console.log(data); //結果をアラートで表示
//   });
//
//   chrome.storage.local.set( {'repUUID': repUUID
//     ,'authToken':authToken
//     , 'repID':repID
//     , 'repTW':repTW
//     , 'repComment':repComment
//     , 'repURL':repURL
//     , 'isOK' :isOK}, function() {
//     // Notify that we saved.
//     console.log('Settings saved');
//   });
//   new Notification('POST_pone', { tag: 'dev', body: '次のツイートを取り置きました\n' + repTW });
// };

// const requetTweet = () => {
//   // let reqUUID = '';
//   // chrome.storage.local.get('reqUUID', function(items) {
//   //   // reqUUID = items.repUUID;
//   //   console.log(items.repUUID.toString());
//   // });
//   let rURL = 'http://localhost:3000/api/tweets/' + LASTrepUUID;
//   $.get(rURL, function(res){
//     console.log(JSON.stringify(res)); //結果をアラートで表示
//     console.log(JSON.stringify(res).isOK);
//       // if (res.body.isOK == true){
//       //
//       // }
//   });
// };
//
// chrome.alarms.onAlarm.addListener(function(alarm) {
//   if (alarm && alarm.name == 'reqTweet') {
//     requetTweet();
//   }
// });
