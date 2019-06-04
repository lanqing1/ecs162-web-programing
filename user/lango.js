'use strict';

// An element to go into the DOM

var lango = React.createElement(
	"h1",
	{ id: "logo" },
	"Lango!"
);

function writeReview() {
    return React.createElement(
        "div",
        { id: "ReviewBtn"/*,onclick: review*/},
        "Start Review");
}

function SaveBtn() {
  return React.createElement(
		"p",
		{id: "store",onClick: storeToDB},
		"Save");
}

function FlexContainer() {
    return React.createElement(
        "div",
        {className: "container"},
        React.createElement(FirstInputCard, null),
        React.createElement(FirstCard, null)
    );
}

function FirstInputCard() {
  return React.createElement("div",
	{className: "inputDiv" },
	React.createElement("textarea",{id: "textArea",onKeyDown: checkReturn}));
}

function FirstCard() {
  return React.createElement(
		"div",
		{className: "outputDiv"},
		React.createElement("p", {id: "outputGoesHere"}));
}
function Footer() {
	return React.createElement("footer",null, " ",
		React.createElement("p", 
		{id: "username",onLoad:changeName()},
		 "username"));
}

var main = React.createElement(
    "main",
    null,
    lango,
    React.createElement(writeReview, null),
    React.createElement(FlexContainer, null),
    React.createElement(SaveBtn, null),
    React.createElement(Footer, null)
);

ReactDOM.render(main, document.getElementById('root'));
var object;
var input;

function checkReturn(event) {
	if (event.keyCode==13) {
		 	input = document.getElementById("textArea").value;
      makeRequest(input);
    }
}

function storeToDB() {
	makeRequestStore(input);
}

function request(method, url) {
	let xhr = new XMLHttpRequest();
	xhr.open(method, url);
	return xhr;
}
function changeName(){
	let url = "/user/query";
	let xhr = request('GET', url);
	xhr.onload = function() {
		let responseStr = xhr.responseText;
		let object = JSON.parse(responseStr);
		console.log(JSON.stringify(object, undefined, 4));
		document.getElementById("username").textContent = object.name;
	}
	xhr.send();
	xhr.onerror = function() {
		alert('Error: Unable to make request');
	};
	
}
function makeRequestStore(anything){
	let url="/user/store?english="+anything+"&korean="+object.Korean;
	let xhr = request('GET', url);
	xhr.onload = function() {
		//xhr.status can check if it's stored.
		if(xhr.status==204){
			console.log("successfully stored");
		}
	}
	xhr.send();
	xhr.onerror = function() {
		alert('Error: Unable to make request');
	};
}

function makeRequest(anything) {
	let url="/user/translate?word="+anything;
	let xhr = request('GET', url);

	xhr.onload = function() {
		let responseStr = xhr.responseText;
		object = JSON.parse(responseStr);
		console.log(JSON.stringify(object, undefined, 4));
		document.getElementById("outputGoesHere").textContent = object.Korean;
		//xhr.status can check if it's stored.
	}

	xhr.send();
	xhr.onerror = function() {
		alert('Error: Unable to make request');
	};
}
