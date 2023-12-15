// ==UserScript== 
// @name        opennet-comments-remover
// @namespace   opennet
// @description Removes comments on www.opennet.ru
// @include     https://www.opennet.ru/* 
// @version     1 
// @grant       none 
// @noframes 
// ==/UserScript== 
 
// находим на странице ссылку на art.shtml и прыгаем по ней со vsluhforum
let vsluhvorumArtIdCheck = window.location.toString().match(/^https:\/\/www.opennet.ru\/openforum\/vsluhforumID3\//)
if (vsluhvorumArtIdCheck != null) {
  var vsluhvorumLinks = [];
  var links = document.getElementsByTagName("a");
  for(var i=0; i<links.length; i++) {
    vsluhvorumLinks.push(links[i].href);
  }
  var vsluhvorumArtLink = vsluhvorumLinks.filter(url => url.match(/^https:\/\/www.opennet.ru\/opennews\/art.shtml.*$/) != null)
  window.location.replace(vsluhvorumArtLink)
}

// Удаляем комментарии и печатную форму
document.getElementsByClassName('ttxt2')[1].remove()
document.getElementsByClassName('ttxt2')[1].remove()
document.getElementsByClassName('ttxt2')[1].remove()

// Отдыхаем от обязанностей модератора
