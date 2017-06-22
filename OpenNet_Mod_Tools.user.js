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


// === NEW CLASSES, SPANS AND IDS ===

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

// === Decorations ===

/* всегда хотел заменить ссылку [Сообщить модератору] на [Удалить] */

var links = document.getElementsByTagName("a");
for (let i=0; i<links.length; i++) {
    // буква С - английская!
    if (links[i].innerHTML == "Cообщить модератору") {
	links[i].innerHTML = "<b>Удалить</b>";
    }
};
   



// === LOCAL STORAGE ===
console.log("db");

/* msgs record:
{ "news-id": 104047,
  "msg-id": 73,
  "user": "freehck",
  "ipv4": "1.2.3.4"}
*/

/* utags record:
{ "user": "freehck",
  "tag": "moderator" }
*/


// This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

if (!indexedDB) {
    window.alert("Ваш браузер не поддерживает IndexedDB. Можете забыть об Opennet Mod Tools");
};

var database = indexedDB.open("opennet-db", 2);
database.onupgradeneeded = function() {
    var db = database.result;
    var store;
    console.log("createdb");
/*    store = db.createObjectStore("msgs", {keyPath: ["news-id", "msg-id"]});
    console.log("msgs middle");
    store.createIndex("ipv4", "ipv4", {unique: false});
    console.log("msgs done")*/
    store = db.createObjectStore("utags");
    store.createIndex("user", "user", {unique: false});
    console.log("utags done")
    
};
database.onerror = function (event) {
    console.log("Database error: " + event.result.errorCode);
};

/*function msgStore(data) {
    database.onsuccess = function() {
	// Start a new transaction
	var db = database.result;
	var tx = db.transaction("msgs", "readwrite");
	var store = tx.objectStore("msgs");
	store.put(data);
    };
};

function msgLookupId(news_id, msg_id) {
    var db = database.result;
    var tx = db.transaction("msgs", "readwrite");
    var store = tx.objectStore("msgs");
    return store.get({news_id, msg_id});
}

function msgLookupIpv4(ipv4) {
    var db = database.result;
    var tx = db.transaction("msgs", "readwrite");
    var store = tx.objectStore("msgs");
    var index = store.index("ipv4");
    return index.get("ipv4",ipv4);
}
*/

function utagsStore(data) {
    database.onsuccess = function() {
	// Start a new transaction
	console.log("1");
	var db = database.result;
	var tx = db.transaction("utags", "readwrite");
	var store = tx.objectStore("utags");
	console.log("try to put: "+JSON.stringify(data));
	var request = store.put(data);
	request.onsuccess = function(e) {
	    console.log("stored");
	};
	request.onerror = function(e) {
	    console.log("ERROR, not stored");
	};
	
    };
}

function utagsLookupUser(user) {
    let result;
    database.onsuccess = function() {
	var db = database.result;
	var tx = db.transaction("utags", "readwrite");
	var store = tx.objectStore("utags");
	var index = store.index("user");
	var getUser = index.get("user",user);
	getUser.onsuccess = function() {
	    console.log("result: "+getUser.result);
	    result = getUser.result;
	};
    };
    return result
}


utagsStore({ user: "freehck", tag: "moderator" });
//utagsLookupUser("freehck");
  
/*
    // Add some data
    store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
    
    // Query the data
    var getJohn = store.get(12345);
    var getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
}
*/








console.log("DONE");
