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
        { id: "ReviewBtn",onClick: startReview},
        "Start Review");
}

function SaveBtn() {
  return React.createElement(
		"p",
		{id: "store",onClick: storeToDB/*,onLoad:checkRedirect()*/},
		"Save");
}

function addBtn() {
    return React.createElement(
        "div",
        { id: "addBtn",onClick: backToSave},
        "Add");
}

function nextBtn() {
    return React.createElement(
        "div",
        { id: "nextBtn",onClick: nextCard},
        "Next");
}

function FlexContainer() {
    return React.createElement(
        "div",
        {className: "container"},
        React.createElement(FirstInputCard, null),
        React.createElement(FirstCard, null)
    );
}

function ReviewFlexContainer() {
    return React.createElement(
        "div",
        {className: "reviewContainer"},
        React.createElement(OutputCard, null),
        React.createElement(InputCard, null)
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

function OutputCard() {
    return React.createElement(
        "div",
        {id: "outputCard"},
        React.createElement("img", {id: "refresh", src: "./assets/noun_Refresh_2310283.svg", onClick: flipCard}),
        React.createElement("p", {id: "reviewOutput",onLoad:getCardsRequest()})
    );
}

function InputCard() {
    return React.createElement(
        "div",
        {id: "inputCard"},
        React.createElement("textarea",{id: "reviewTextArea", onKeyDown: checkAnswer})
        //click or hit enter will flip cards and check answer???
    );
}

function flipCard() {
    console.log("Just here to avoid errors for now");
    //Implement flipcard. I think there is a demo.
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

let review = React.createElement(
    "main",
    null,
    lango,
    React.createElement(addBtn, null),
    React.createElement(ReviewFlexContainer, null),
    React.createElement(nextBtn, null),
    React.createElement(Footer, null)
);

ReactDOM.render(main, document.getElementById('root'));


function startReview() {
    ReactDOM.render(review, document.getElementById('root'));
}

function backToSave() {
    ReactDOM.render(main, document.getElementById('root'));
}

var object;
var input;
var data;
var index=0;

function checkReturn(event) {
	if (event.keyCode==13) {
		input = document.getElementById("textArea").value;
        makeRequest(input);
    }
}

function checkAnswer(event) {
    if (event.keyCode == 13) {
        let answer = document.getElementById("reviewTextArea").value;
        console.log("Checking answer!")
        //Actually check answer... have to do this on server side.
        //update correct
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
/* doesn't work. How to check redirect???
function checkRedirect(){
    let url = "/auth/accepted";
    let xhr = request('GET', url);
    xhr.onload = function() {
		let responseStr = xhr.responseText;
        if(responseStr){
            startReview();
        }else{
            backToSave();
        }
	}
	xhr.send();
    
}
*/
function getCardsRequest(){
    let url = "/user/getcards";
    let xhr = request('GET', url);
    xhr.onload = function() {
		let responseStr = xhr.responseText;
		data = JSON.parse(responseStr);
        //console.log(data);
        if(data){
            document.getElementById("reviewOutput").textContent = data[0].english;
            updateSeenRequest(data[0].english);
            index=1;
        }else{
            document.getElementById("reviewOutput").textContent ="Finished reviewing";
        }
	}
	xhr.send();

}
function nextCard(){
    if(data[index]){
        document.getElementById("reviewOutput").textContent = data[index].english;
        updateSeenRequest(data[index].english);
        index++;
    }else{
        document.getElementById("reviewOutput").textContent = "Finished reviewing";
    }
}
function updateSeenRequest(en){
    let url = "/user/seen?english="+en;
    let xhr = request('GET',url);
    xhr.onload = function() {
		if(xhr.status==204){console.log("updated");}
	}
	xhr.send();
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
