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

// определение выходных узлов tor
// https://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=94.142.141.14&port=443

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
//      links[i].parentElement.innerHTML = "<span class='user'> <a href=\"" + links[i].href + "\">" + links[i].text + "</a> " + "[" + utags[name].toString() + "] </div>"
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

/*
if (window.localStorage) {
    alert("localstorage exists");
} else {
    alert("noooooo!");
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
    alert('Great success! All the File APIs are supported.');
} else {
    alert('The File APIs are not fully supported in this browser.');
}
*/


// ==== TOP MENU ====

/*
  Мы крутим страничку, а элементы управления модераторскими
  инструментами всегда наверху экрана.
*/
var stalker = document.createElement("header");
stalker.className = "stalker";
stalker.id = "stalker";
stalker.style.textAlign = "center";
stalker.style.backgroundColor = "white";
stalker.style.position = "fixed";
stalker.style.top = "0px";
stalker.style.left = "0px";
stalker.style.width = "100%";
stalker.style.padding = 0;
stalker.style.border = 1;

var menu = document.createElement("table");
menu.align = "center";
menu.width = "80%";
menu.border = 1;
menu.style.textAlign = "center";
menu.style.tableLayout = "fixed";
menu.insertRow();

menu.rows[0].insertCell();
menu.rows[0].cells[0].innerHTML = "<b>Peter Peter Pumpkin Eater!</b>";

menu.rows[0].insertCell();
menu.rows[0].cells[1].innerHTML = "<b>My name's Jobe</b>";

stalker.appendChild(menu);
document.body.appendChild(stalker);

// space in the top is needed because top menu has fixed position
let stalker_height = document.getElementById("stalker").offsetHeight;
document.body.style.paddingTop = stalker_height;

// jump higher than anchors when follow links  are because of top menu
window.addEventListener("hashchange", function () {
    window.scrollTo(window.scrollX, window.scrollY - stalker_height);
});

//jump higher than anchors if we load page on anchor
window.onload = function() {
    if (window.location.href.indexOf('#') > -1) {
	window.scrollTo(window.scrollX, window.scrollY-1);
    };
}


// NEW CLASSES, SPANS AND IDS

/*
  Приводим содержимое страницы в божеский вид, с которым хотя бы можно
  работать. Потому что тут форматирование страницы ей-богу на уровне
  конца девяностых.

  Здесь все ссылки на пользователей заворачиваются в span с классом
  user, создаются id некоторым важным объектам.
*/

// 8я таблица -- это Оглавление
document.body.getElementsByTagName("table")[8].id = "table-of-contents";
// Сообщения по теме - это таблицы в первом параграфе после Содержания
document.getElementById("table-of-contents").nextSibling.id = "messages";

// каждая 2я ссылка в table-of-contents -- на пользователя
let lis = document.getElementById("table-of-contents").getElementsByTagName("li");
for (let i=0; i<lis.length; i++) {
    let user = lis[i].getElementsByTagName("a")[1];
    user.outerHTML = "<span class='user'>" + user.outerHTML + "</span>";
};

// первые 2 таблицы - заполнитель и верхнее управление
// последняя таблица - тоже управление
var msgs = document.getElementById("messages").getElementsByTagName("table");
for (let i=2; i<msgs.length-1; i++) {
    msgs[i].className = "msg";
    // отступы сообщений в тредах делаются добавлением строки одной ячейкой фиксированной ширины и rowspan=5
    // короче, надо брать третью ячкейку С КОНЦА!
    let row_index = msgs[i].tBodies[0].rows.length - 3; 
    let user = msgs[i].tBodies[0].rows[row_index].cells[0].getElementsByTagName("a")[0];
    user.outerHTML = "<span class='user'>" + user.outerHTML + "</span>";
}





// LOCAL STORAGE

var db = localStorage;

if (db.length == 0) {
    db.setItem("usertags", null);
}

console.log("DONE");
