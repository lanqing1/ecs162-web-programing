"strict mode";

console.log("Script Running...");
var object;
var input;
function getInput(ele) {
  if(event.key === 'Enter') {
    input =ele.value;
    makeRequest(input,"translate");
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
function makeRequestStore(anything){
  let url="store?english="+anything+"&korean="+object.Korean;
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
  let url="translate?word="+anything;
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
