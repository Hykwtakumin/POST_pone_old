'use strict';

let socket = io('http://localhost:3000');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
  let clientID = uuid.v4();
  localStorage['clientID'] = clientID;
  console.log('your ClientID=', localStorage['clientID']);
});

chrome.alarms.create('reqTweet', { periodInMinutes: 1 });

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
    localStorage['localBody'] = details.requestBody.formData;
    let repUUID = uuid.v1();
    let repComment = '';
    let isOK = false;
    let authToken = details.requestBody.formData.authenticity_token.toString();
    let repTW = details.requestBody.formData.status.toString();
    // let repID = turlarray[5];
    let in_reply_to_status_id = details.requestBody.formData.in_reply_to_status_id.toString();
    if (repTW.indexOf('@') !== -1){
      // console.log(details.requestBody);
      // socket.emit('send_Body', {
      //   sendHeaders: details.requestBody.formData
      // });
      // toHeaders(clientID,authToken,repID,repTW,repUUID,repComment,repURL,isOK);
      toHeaders(authToken,in_reply_to_status_id,repTW,repUUID);
      // return {cancel: true};
      //socket.on('confirmed' function(data){});
    }else{
      return {cancel: false};
    }
  },
  {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*']},
  ['requestBody','blocking']);

const toHeaders = (authToken,in_reply_to_status_id,repTW,repUUID) =>{
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details){
      localStorage['localHeader'] = details.requestHeaders ;
      let repURL = details.requestHeaders[6].value;
      console.log(repURL);
      let repComment = '';
      new Notification('POST_pone', { tag: 'dev', body: '次のツイートが取り置かれました\n' + repTW });

      var confirm_result = null ;

      // socket.emit('test_onack', {testmessage: 'hello!'}, function onack(response){
      //   console.log(response);
      //   }
      // );

      post(data).then(function(response) {
        doSomethingWith(response);
      });

      function post(data) {
        return new Promise(function(resolve, reject) {
          socket.emit("post_tweet", data, resolve);
        });
      }

      socket.emit('post_tweet',{
        clientID: localStorage['clientID'],
        authToken: authToken,
        repUUID: repUUID,
        in_reply_to_status_id: in_reply_to_status_id,
        repTW: repTW,
        repComment: repComment,
        repURL: repURL,
        sendPerson: '',
        isOK: false
      }, function onack(response){
        console.log(response);
        if(response.confirm_result == true){
          // return {cancel: false};
          confirm_result = false;
        }else{
          new Notification('POST_pone', { tag: 'dev', body: '査読結果が出ました。\n' + response.draft_Text });
          // return {cancel: true};
          confirm_result = true;
        }
      });

      return {cancel: confirm_result};
      //   let pURL = 'http://localhost:3000/api/tweets' + repUUID;
      //   let postData = {
      //                   'clientID': localStorage['clientID']
      //                   ,'repUUID': repUUID
      //                   ,'authToken':authToken
      //                   , 'repID':in_reply_to_status_id
      //                   , 'repTW':repTW
      //                   , 'repComment':repComment
      //                   , 'repURL':repURL
      //                   , 'sendPerson': ''
      //                   , 'isOK' :false
      //   };
      //   $.post(pURL, postData, function(data){
      //
      //     console.log(data); //結果をアラートで表示
      //   });
      //
      // return {cancel: true};


      // socket.on('confirm_tweet', function (data) {
      //   console.log('tweet confirmed!');
      //   console.log(data);
      //   return {cancel: false};
      // });

      // socket.on('confirmed', function(){
      //   return {cancel: true};
      // });
      // return {cancel: true};
    },
    {urls: ['*://twitter.com/i/tweet/create*','*://twitter.com/i/tweet/retweet*']},
    ['requestHeaders','blocking']);
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

//
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