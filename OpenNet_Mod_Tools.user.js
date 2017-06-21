// ==UserScript==
// @name        OpenNet Mod Tools
// @namespace   opennet-mod-tools
// @description Extend interface functionality for OpenNet moderators
// @include     https://www.opennet.ru/openforum/vsluhforumID3/*
// @version     0.2
// @grant       none
// ==/UserScript==

/* Данный userscript создан для облегчения задачи модерирования проекта opennet
 * Я не вебник, так что нахакал как сумел
 * Функциональность состоит из двух частей:
 * 1) Расстановки тегов
 * 2) Отслеживанием сообщений по ip
 *
 * Теги расставляются при помощи праввки исходного кода скрипта, пример показан ниже.
 * Отслеживание по ip производится при нажатии на кнопку (((>o<))), которая есть у каждого сообщения.
 * При этом сообщения в новости, сделанные с одного ip-адреса окрашиваются в розовый цвет.
 * Также при отслеживании полезно открыть js-консоль (Shift+Ctrl+J):
 * При отслеживании туда выводится информация об количестве сообщений пользователя и ссылки на все найденные его сообщения.
 *
 * Надо иметь в виду, что реально помеченных сообщений может быть меньше найденных.
 * Это связано с тем, что какие-то сообщения могут быть либо удалены, либо одно из них
 * собственно сама новость и есть.
 * 
 * Также, поскольку отслеживание ведётся путём грепанья лога, в темах недельной давности отслеживание работать не будет.
*/


// определение news_id:
// работает для ссылок типа 
// https://www.opennet.ru/openforum/vsluhforumID3/109668.html

function last (lst) {
  return lst[lst.length-1]
}

var news_id = last(document.location.href.split("/")).match(/\d+/)[0];

var utags = {};

// теги
let mod = "mod" // модераторы
let smart = "smart" // стоит прислушаться
let fat = "дебил" // толстые тролли
let troll = "troll" // тонкие тролли
let mssp = "mssp" // страх и ненависть Шигорина

// люди
utags["freehck"] = [mod]
utags["Michael Shigorin"] = [mod]
utags["Сергей"] = [fat]
utags["Celcion"] = [smart]
utags["Crazy Alex"] = [smart]
utags["Andrey Mitrofanov"] = [smart]

// расстановка тэгов
var links = document.getElementsByTagName("a");
for (i in links) {
  name = links[i].text;
  if (name in utags) {
      links[i].parentElement.innerHTML = "<a href=\"" + links[i].href + "\">" + links[i].text + "</a> " +
                                         "[" + utags[name].toString() + "]"
   };
};

// раскраска сообщений

function li_msg_id (id) {
  return ("t" + id)
}

function mark_li (id, color) {
  let elem = document.getElementById(li_msg_id(id));
  if (elem != null)
    elem.style.backgroundColor = color
}

// раскраска сообщений

function msg_id (id) {
  return ("m" + id)
}

function mark_msg (id, color) {
  let elem = document.getElementById(msg_id(id));
  if (elem != null) { // если сообщение удалено модератором
    var tbl = elem.parentElement;
    tbl.getElementsByTagName("blockquote")[0].style.backgroundColor = color;
  }
}

function mark (id, color) {
  mark_msg(id, color);
  mark_li(id, color);
}

var MARKED_IDS = [];

function mark_all (ids, color) {
  for (var i=0; i<ids.length; i++) {if (ids[i] != 0) mark(ids[i], color)} // сравнение исключает саму новость
}

function unmark_all () {
  for (var i=0; i<MARKED_IDS.length; i++) {if (MARKED_IDS[i] != 0) mark(MARKED_IDS[i], "#DDE1C2")}
}

function num_of_str (s) {
  return (s.match(/\d+/)[0])
}

function lookup_url (news_id, id) {
    return ("https://www.opennet.ru/cgi-bin/openforum/a/show_ip.cgi?forum=vsluhforumID3&om="+news_id+"&omm="+id)
  }

function get_content () {
    alert( this.responseText );
  }

function get_content_and_hl () {
    let content = this.responseXML;
    let links = content.getElementsByTagName("a");
    console.log("---------------------")
    var hl_ids = [];
    for (var i=0; i<links.length; i++) {
      console.log(links[i].href);
      var [some_news_id, msg_id] = last(links[i].href.split("/")).match(/\d+/g);
      if (some_news_id == news_id) {
        hl_ids.push(msg_id);
      }
    }
    console.log("Total messages found: "+links.length);
    console.log("Messages in this news: "+hl_ids.length);
    unmark_all();
    mark_all(hl_ids, "pink");
    MARKED_IDS = hl_ids;
  }
  
function lookup_msg_id (news_id, id) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", get_content_and_hl);
    req.open("GET", (lookup_url(news_id, id)));
    req.withCredentials = true;
    req.responseType = "document";
    req.send()
  }

var msgs = document.querySelectorAll('[id^=m]');
for (var i=0; i<msgs.length; i++) {
  let message = msgs[i];
  let id = num_of_str(msgs[i].id);
  let lookup = message.getElementsByTagName("a")[0].parentElement
  .appendChild(document.createTextNode(" ")).parentElement
  .appendChild(document.createElement("b"))
  .appendChild(document.createElement("a"));
  lookup.onclick = function () {lookup_msg_id(news_id, id)};
  lookup.text = "(((>o<)))";
}
