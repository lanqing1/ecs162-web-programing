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
        {className: "outputCard", onClick: answerCard},
        React.createElement("img", {id: "refresh", src: "./assets/noun_Refresh_2310283.svg"}),
        React.createElement(
            "div",
            {className: "flip-card-inner", id: "flipMe"},
            React.createElement(
                "div",
                {className: "flip-card-front"},
                React.createElement(
                    "p",
                    {id: "reviewOutput", onLoad:getCardsRequest()}
                )
            ),
            React.createElement(
                "div",
                {className: "flip-card-back"},
                React.createElement(
                    "p",
                    {className: "text_correct", id: "text_correct_id"},
                    "Correct!"
                )
            )
        )       
    );
}

function InputCard() {
    return React.createElement(
        "div",
        {id: "inputCard"},
        React.createElement("textarea",{id: "reviewTextArea", onKeyDown: checkAnswer})
    );
}

function answerCard() {
    //If the user simply clicks on the card, don't show the Correct! sign, instead show the correct answer.
    let element = document.getElementById("text_correct_id");
    element.classList.add("text_incorrect");
    element.classList.remove("text_correct");
    element.textContent = data[index].english; 
    document.getElementById("flipMe").style.transform="rotateY(180deg)";
}

function flipCard() {
    document.getElementById("flipMe").style.transform="rotateY(180deg)";
}

function unFlipCard() {
    document.getElementById("flipMe").style.transform="none";
}

function Footer() {
    return React.createElement("footer",null, " ",
        React.createElement("p", 
        {id: "username",onLoad:changeName()},
         "username")
    );
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
        event.preventDefault();  //Avoids getting a newline when all we wanted is to detect ENTER
        input = document.getElementById("textArea").value;
        makeRequest(input);
    }
}

function checkAnswer(event) {
    console.log("Checking answer!")
    if (event.keyCode == 13) {
        event.preventDefault();
        let answer = document.getElementById("reviewTextArea").value;
        
        if(answer==data[index].english){//if correct update correct
            flipCard();
            updateCorrectRequest(data[index].english);
        }else{
            answerCard();
        }
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

var = numCards;

function getCardsRequest(){
    let url = "/user/getcards";
    let xhr = request('GET', url);
    xhr.onload = function() {
        let responseStr = xhr.responseText;
        data = JSON.parse(responseStr);
        console.log("getCardsRequest: ",JSON.stringify(data, undefined, 4));
        if(data){
            numCards = data.length;
            index = getScore();
            document.getElementById("reviewOutput").textContent = data[index].korean;
            updateSeenRequest(data[index].english);
        }else{
            document.getElementById("reviewOutput").textContent ="Finished reviewing";
        }
    }
    xhr.send();

}
function getScore(){
    var randomNum;
    var score;
    var randomCard;
    do{
        let arraySize = data.length;
        randomCard = Math.floor(Math.random() * arraySize);// random card
        let correct = data[randomCard].correct;
        let seen = data[randomCard].seen;
        randomNum=Math.floor(Math.random() * 16);//random num
        score = Math.max(1,5-correct)+Math.max(1,5-seen)+5*((seen-correct)/seen);
        console.log("score"+score);
    }while (randomNum<=score);
    return(randomCard);
}
function nextCard(){
    if( numCards == 0 ){
        document.getElementById("reviewOutput").textContent = "Finished Reviewing!";
    } else {
        index=getScore();
        document.getElementById("reviewOutput").textContent = data[index].korean;
        updateSeenRequest(data[index].english);
        numCards--;
    }
    unFlipCard();
}
function updateSeenRequest(en){
    let url = "/user/seen?english="+en;
    let xhr = request('GET',url);
    xhr.onload = function() {
        if(xhr.status==204){console.log("updated");}
    }
    xhr.send();
}
function updateCorrectRequest(en){
    let url = "/user/correct?english="+en;
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
//redirect to review page for old users
function checkUser(){
    let url = "/user/getcards";
    let xhr = request('GET', url);

    xhr.onload = function() {
        let responseStr = xhr.responseText;
        object = JSON.parse(responseStr);
        console.log(JSON.stringify(object, undefined, 4));
        if(object.length == 0){
            backToSave();
        }else{
            startReview();
            console.log("checkUser(): ", object);
        }
    }
    xhr.send();
    xhr.onerror = function() {
        alert('Error: Unable to make request');
    };

}
checkUser();
