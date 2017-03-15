// ==UserScript==
// @name        QuizChan on Nicolive
// @namespace   http://www.mysys.org/eagle0wl/
// @description ニコ生にクイズちゃん回答用フォームを追加します。
// @include     http://live.nicovideo.jp/watch/*
// @require     https://rawgit.com/polygonplanet/encoding.js/master/encoding.min.js
// @author      eagle0wl
// @license     MIT
// @version     0.01a
// @grant       none
// ==/UserScript==

var STR_VERSION = "QuizChan on Nicolive ver0.01a by eagle0wl";
var STR_HELP = "名前を入れます。エンコードしたいメッセージの入力後、Enterを１回押すとクリップボードにエンコード済み文字列がコピーされます。さらにTABを１回押すとニコ生のコメント入力欄にフォーカスが移動するので、ペーストして投稿してください。投稿後、TABキーでコメント入力欄に戻れずマウス操作が必要ですが技術上の仕様です。";


function isNazoNamaLive() {
	
	var meta = document.getElementsByClassName("meta")[0];
	if (typeof meta === "undefined") {
		return false;
	}
	
	var a = meta.getElementsByTagName("a");
	if (a.length != 2) {
		return false;
	}
	
	// 謎の実験場
	commurl = meta.getElementsByTagName("a")[0].href;
	if (commurl !== "http://com.nicovideo.jp/community/co1894672") {
		return false;
	}
	// ．ａ
	userurl = meta.getElementsByTagName("a")[1].href;
	if (userurl !== "http://www.nicovideo.jp/user/13210902") {
		return false;
	}
	
	return true;
	
}


function encode() {
	
	console.log("encode");
	
	var username = document.getElementById("quizchan_username").value;
	var message = document.getElementById("quizchan_message").value;
	username = username.replace(/^\s*|\s*$/g, "");
	message = message.replace(/^\s*|\s*$/g, "");
	
	var encodedmessage = document.getElementById("quizchan_encodedmessage");
	
	if (username === "") {
		encodedmessage.value = "名前を入れてね";
		return false;
	}
	if (message === "") {
		encodedmessage.value = "メッセージを入れてね";
		return false;
	}
	
	// UTF-16 -> UTF-8 -> SJIS (encoding.js の仕様により\は?になる)
	var utf16str = "DOT_A" + username + "@" + message;
	var utf8str = unescape(encodeURIComponent(utf16str));
	var sjisstr = Encoding.convert(utf8str, {to: 'SJIS', from: 'UTF8'});
	
	encodedmessage.value = window.btoa(sjisstr);
	
	return true;
}


function focus() {
	
	console.log("focus");
	
	var encodedmessage = document.getElementById("quizchan_encodedmessage");
	encodedmessage.select();
	document.execCommand("copy");
	var flvplayer = document.getElementById("flvplayer");
	flvplayer.focus();
	
}


function init() {

	var box_inner = document.getElementsByClassName("box_inner")[2];
	var flvplayer_container = document.getElementById("flvplayer_container");

	var quizchanNode = document.createElement("div");
	
	quizchanNode.id = "quizchan_field";
	quizchanNode.style.position = "relative";
	quizchanNode.style.height = "1.5em";
	quizchanNode.style.padding = "4px";
	quizchanNode.style.border = "2px solid #000000";
	quizchanNode.style.backgroundColor = "#cccccc";

	var quizchanUserNameText = document.createElement("input");
	quizchanUserNameText.id = "quizchan_username";
	quizchanUserNameText.placeholder = "あなたの名前";
	quizchanUserNameText.style.position = "absolute";
	quizchanUserNameText.style.left = "2px";
	quizchanUserNameText.style.padding = "4px";
	quizchanUserNameText.style.width = "144px";
	quizchanUserNameText.style.height = "1em";
	quizchanUserNameText.style.fontFamily = "sans-serif";
	quizchanUserNameText.style.fontSize = "12px";
	quizchanUserNameText.onkeyup = function (e) {
		encode();
	};
	quizchanNode.appendChild(quizchanUserNameText);

	var quizchanMessageText = document.createElement("input");
	quizchanMessageText.id = "quizchan_message";
	quizchanMessageText.placeholder = "エンコードしたいメッセージ";
	quizchanMessageText.style.position = "absolute";
	quizchanMessageText.style.left = "160px";
	quizchanMessageText.style.padding = "4px";
	quizchanMessageText.style.width = "258px";
	quizchanMessageText.style.height = "1em";
	quizchanMessageText.style.fontFamily = "sans-serif";
	quizchanMessageText.style.fontSize = "12px";
	quizchanMessageText.onkeyup = function (e) {
		encode();
	};
	quizchanMessageText.onkeypress = function (e) {
		console.log("message onkeypress");
		if (false == encode()) {
			return true;
		}
		if(e.keyCode == 13) {
			focus();
			return false;
		}
	};
	quizchanNode.appendChild(quizchanMessageText);

	var quizchanEncodedMessageText = document.createElement("input");
	quizchanEncodedMessageText.id = "quizchan_encodedmessage";
	quizchanEncodedMessageText.placeholder = "メッセージ（エンコード済）";
	quizchanEncodedMessageText.style.position = "absolute";
	quizchanEncodedMessageText.style.left = "432px";
	quizchanEncodedMessageText.style.padding = "4px";
	quizchanEncodedMessageText.style.width = "192px";
	quizchanEncodedMessageText.style.height = "1em";
	quizchanEncodedMessageText.style.fontFamily = "sans-serif";
	quizchanEncodedMessageText.style.fontSize = "12px";
	quizchanEncodedMessageText.style.backgroundColor = "#cccccc";
	quizchanEncodedMessageText.readOnly = true;
	quizchanEncodedMessageText.onkeypress = function (e) {
		console.log("enc message onkeypress");
		if(e.keyCode == 13) {
			focus();
			//return false;
		}
	};
	quizchanEncodedMessageText.onclick = function (e) {
		console.log("enc message onclick");
		this.focus();
		this.select();
	};
	quizchanNode.appendChild(quizchanEncodedMessageText);

	var quizchanHelp = document.createElement("span");
	var textHelp = document.createTextNode("[？]");
	quizchanHelp.appendChild(textHelp);
	quizchanHelp.style.position = "absolute";
	quizchanHelp.style.left = "642px";
	quizchanHelp.style.height = "1em";
	quizchanHelp.style.lineHeight = "20px";
	quizchanHelp.style.display = "inline-block";
	quizchanHelp.style.color = "#0000ff";
	quizchanHelp.style.fontWeight = "bold";
	quizchanHelp.title = STR_HELP;
	quizchanNode.appendChild(quizchanHelp);

	var quizchanVersion = document.createElement("span");
	var textVersion = document.createTextNode(STR_VERSION);
	quizchanVersion.appendChild(textVersion);
	quizchanVersion.style.position = "absolute";
	quizchanVersion.style.right = "6px";
	quizchanVersion.style.height = "218px";
	quizchanVersion.style.lineHeight = "20px";
	quizchanVersion.style.display = "inline-block";
	quizchanNode.appendChild(quizchanVersion);

	box_inner.insertBefore(quizchanNode, flvplayer_container.nextSibling);
	
}

/*
if (!isNazoNamaLive()) {
	return;
}
*/

init();
encode();

// my script is fu*kin legacy. hehehe.
