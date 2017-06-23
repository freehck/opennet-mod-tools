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

console.log("load OpenNet Mod Tools");

var currentNewsId = last(document.location.href.split("/")).match(/\d+/)[0];
var news_id = currentNewsId; // obsolete








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

















// ==================== TOP MENU ====================

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




// ==================== DOM Normalization ====================

/* DOM этой страницы является вёрсткой-атавизмом-из-девяностых.
 * Чудом выдираем основные конструктивные элементы и снабжаем их
 * классами, идентификаторами, дополнительными тэгами
 */

// 8я таблица -- это Оглавление
document.body.getElementsByTagName("table")[8].id = "table-of-contents";
// Сообщения по теме - это таблицы в первом параграфе после Содержания
document.getElementById("table-of-contents").nextSibling.id = "messages";

// каждая 2я ссылка в table-of-contents -- на пользователя
let lis = document.getElementById("table-of-contents").getElementsByTagName("li");
for (let i=0; i<lis.length; i++) {
    let user = lis[i].getElementsByTagName("a")[1];
    //user.parentNode.outerHTML = makeUserNode(user.innerHTML)
};

// первые 2 таблицы - заполнитель и верхнее управление
// последняя таблица - тоже управление
var msgs = document.getElementById("messages").getElementsByTagName("table");
for (let i=2; i<msgs.length-1; i++) {
    msgs[i].className = "msg";
    // отступы сообщений в тредах делаются добавлением строки одной ячейкой фиксированной ширины и rowspan=5
    // короче, надо брать третью строку С КОНЦА!
    let tableRowsNum = msgs[i].tBodies[0].rows.length;
    if (tableRowsNum == 4 || tableRowsNum == 5) {
	let userNode = msgs[i].tBodies[0].rows[tableRowsNum-3].cells[0].getElementsByTagName("a")[0];
	let userName = userNode.innerHTML;
	let msgId = msgs[i].tBodies[0].rows[tableRowsNum-4].cells[0].getElementsByTagName("a")[0].getAttribute("name");
	userNode.parentNode.outerHTML = makeUserNode(userName, msgId);
    };
}

/* всегда хотел заменить ссылку [Сообщить модератору] на [Удалить] */
var links = document.getElementsByTagName("a");
for (let i=0; i<links.length; i++) {
    // буква С - английская!
    if (links[i].innerHTML == "Cообщить модератору") {
	links[i].innerHTML = "<b>Удалить</b>";
    }
};

/* Итого:
 * - содержание имеет id "table-of-contents"
 * - блок с сообщениями имеет id "messages"
 * - все сообщения имеют class "msg"
 * - все имена пользователей завёрнуты в span с class "user"
 */

// ==================== User Node ====================

// генерирует ноду, которая замещает ссылки на имена пользователей
function makeUserNode(userName, msgId) {
    if (msgId === undefined || msgId === null) { msgId = 12 };
    let r = 
        "<span class='user'>"
	  + "<font style='display:none' class='msgid'>"+msgId+"</font>"
	  + "<b><a class='username' href='/~"+userName+"'>"+userName+"</a></b> "
	  + "<b><span class='tagsLeft'></span><span class='tags'></span><span class='tagsRight'></span></b> "
	  + "<span class='actions'>"
          + " -- "
            + "<b><a onclick=\"utagsStorePrompt('"+userName+"')\">[+]</a></b> "
          + " -- "
            + "<b><a onclick=\"makeShowIpRequest('"+msgId+"')\">(((>o<)))</a></b>" // for (((>o<)))
          +"</span>"
	+ "</span>";
    return r;
}

// Выдирает из неё имя пользователя
function getUserName(node) {
    return node.getElementsByClassName("username")[0].innerHTML
}

// генерирует ноду с тегом для текущего пользователя
// эта нода вставляется в пользовательскую ноду
function makeUserTagNode(userName,tagName) {
    let r = tagName + "<a onclick=\"utagsDelete('"+userName+"','"+tagName+"')\">(x)</a>";
    return r
}

// ==================== Databases ====================
/*
 * Давайте сразу на чистоту: я не разобрался как сделать два
 * objectStore в одной базе, сделать две базы оказалось проще. Если
 * кого-то это волнует, сами допиливайте.
 */

// This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
var indexedDB =
    window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB
    || window.msIndexedDB || window.shimIndexedDB;

if (!indexedDB) {
    window.alert("Ваш браузер не поддерживает IndexedDB. Можете забыть об Opennet Mod Tools");
};

// ==================== User Tags ====================

var utagsDBName = "opennet-utags";
var utagsDB;
var utagsDBOpenRequest = indexedDB.open(utagsDBName);
    
utagsDBOpenRequest.onsuccess = function(e) {
    utagsDB = utagsDBOpenRequest.result;
    console.log("UTAGS database has been opened");
    displayUserTags();
};

utagsDBOpenRequest.onupgradeneeded = function(event) {
    utagsDB = event.target.result;
    let store = utagsDB.createObjectStore("utags", {keyPath: ["user", "tag"]});
    store.createIndex("user", "user", {unique: false});
    store.createIndex("tag", "tag", {unique: false});
    console.log("UTAGS store created")
};

utagsDBOpenRequest.onerror = function (event) {
    console.log("UTAGS database error: " + event.result.errorCode);
};

/* utags record:
 * {
 *   "user": "freehck",
 *   "tag": "moderator"
 * }
 */

function displayUserTags() {
    console.log("display user tags");
    let users = document.body.getElementsByClassName("user");
    for (let i=0; i<users.length; i++) {
	let userNode = users[i];
	let name = getUserName(userNode);
	let tagsNode = userNode.getElementsByClassName("tags")[0];
	let tagsNodeLeft = userNode.getElementsByClassName("tagsLeft")[0];
	let tagsNodeRight = userNode.getElementsByClassName("tagsRight")[0];
	tagsNode.innerHTML="";
	tagsNodeLeft.innerHTML="";
	tagsNodeRight.innerHTML="";
	let firstTag = true;
	let objectStore = utagsDB.transaction("utags", "readwrite").objectStore("utags");
	objectStore.openCursor().onsuccess = function(event) {
	    let cursor = event.target.result;
	    if (cursor && cursor.value.user == name) {
		let tagName = cursor.value.tag;
		if(!firstTag) {
		    tagsNode.innerHTML += ","+makeUserTagNode(name,tagName);
		} else {
		    tagsNodeLeft.innerHTML='[';
		    tagsNode.innerHTML += makeUserTagNode(name,tagName);
		    tagsNodeRight.innerHTML=']';
		    firstTag=false
		};
		cursor.continue();
	    };
	};
    };
};

function utagsStore(data) {
    var tx = utagsDB.transaction("utags", "readwrite")
    //console.log("try to put: "+JSON.stringify(data));
    var request = tx.objectStore("utags").put(data);
    tx.oncomplete = function() {
	displayUserTags();
    }
};
unsafeWindow.utagsStore = function(data) { utagsStore(data) };

function utagsDelete(user,tag) {
    let tx = utagsDB.transaction("utags", "readwrite");
    //console.log("try to remove: "+JSON.stringify({"user": user, "tag": tag}));
    let request = tx.objectStore("utags").delete([user, tag]);
    tx.oncomplete = function () {
	displayUserTags();
    };
}
unsafeWindow.utagsDelete = function(user,tag) { utagsDelete(user,tag) }

function utagsStorePrompt(userName) {
    let tagName = prompt("Новый тэг для пользователя "+userName+":","");
    if (tagName !== null) {
	if (tagName.length == 0) {
	    alert("Тэг не может быть пустым!")
	} else {
	    utagsStore({"user":userName, "tag":tagName});
	}
    }
}
unsafeWindow.utagsStorePrompt = function(username) { utagsStorePrompt(username) };

// ==================== Message DB ====================

var msgsDBName = "opennet--test1"
var msgsDB;
var msgsDBOpenRequest = indexedDB.open(msgsDBName);
    
msgsDBOpenRequest.onsuccess = function(e) {
    msgsDB = msgsDBOpenRequest.result;
    console.log("MSGS database has been opened");
};

msgsDBOpenRequest.onupgradeneeded = function(event) {
    msgsDB = event.target.result;
    let store = msgsDB.createObjectStore("msgs", {keyPath: ["newsId", "msgId"]});
    store.createIndex("newsId", "newsId", {unique: false});
    store.createIndex("msgId", "msgId", {unique: false});
    store.createIndex("user", "user", {unique: false});
    store.createIndex("ipv4", "ipv4", {unique: false});
    console.log("MSGS store created")
};

msgsDBOpenRequest.onerror = function (event) {
    console.log("MSGS database error: " + event.result.errorCode);
};

/* msgs record:
 * {
 *   "newsId": 104047,
 *   "msgId": 73,
 *   "user": "freehck",
 *   "ipv4": "1.2.3.4"
 * }
 */

function makeMsgRecord(newsId, msgId, userName, ipv4) {
    return {"newsId": newsId, "msgId": msgId, "user": userName, "ipv4": ipv4}
}

function msgStore(data) {
    let tx = msgsDB.transaction("msgs", "readwrite");
    tx.objectStore("msgs").put(data);
    tx.oncomplete = function() { console.log("msg stored: "+JSON.stringify(data)) };
}

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

// ==================== SHOW IP API ====================

function makeShowIpUrl(msgId) {
    return ("https://www.opennet.ru/cgi-bin/openforum/a/show_ip.cgi?forum=vsluhforumID3&om="+currentNewsId+"&omm="+msgId);
};

function makeShowIpRequest(msgId) {
    var req = new XMLHttpRequest();
    req.addEventListener("load", storeShowIpResponse);
    req.open("GET", makeShowIpUrl(msgId));
    req.withCredentials = true;
    req.responseType = "document";
    req.send()
};
unsafeWindow.makeShowIpRequest = function(msgId) { makeShowIpRequest(msgId) };

function storeShowIpResponse() {
    let content = this.responseXML;
    let links = content.getElementsByTagName("a");
    let data = [];
    for (let i=0; i<links.length; i++) {
	let link = links[i];
	//console.log("source: "+link.outerHTML);
	let [newsId, msgId] = last(link.href.split("/")).match(/\d+/g);
	let [userName, ipv4] = link.innerHTML.split("  ");
	//console.log("data: "+newsId+" "+msgId+" "+userName+" "+ipv4);
	msgStore(makeMsgRecord(newsId,msgId,userName,ipv4));

    }
}





// ==================== Onload ====================




window.onload = function() {
    console.log("onload mod-tools");

    //jump higher than anchors if we load page on anchor (top menu)
    if (window.location.href.indexOf('#') > -1) {
	window.scrollTo(window.scrollX, window.scrollY-1);
    };





};





// ==================== useful functions ====================

function last (lst) {
  return lst[lst.length-1]
}
