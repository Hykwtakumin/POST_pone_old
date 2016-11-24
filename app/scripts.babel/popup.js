'use strict';

console.log('\'Allo \'Allo! Popup');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  console.log(request);
  $('p.result_text').text(request);
  var response = {data: 'success'};
  sendResponse(response);
});
