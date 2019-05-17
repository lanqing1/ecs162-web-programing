"strict mode";

console.log("Script Running...");
function getInput() {
    let input = document.getElementById("word").value;
    makeRequest(input);
}

function request(method, url) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    return xhr;
}

function makeRequest(anything) {
    let url = "query?word="+anything;
    let xhr = request('GET', url);

    xhr.onload = function() {
        let responseStr = xhr.responseText;
        let object = JSON.parse(responseStr);
//	console.log(xhr);
//	console.log(res);
        console.log(JSON.stringify(object, undefined, 4));
        document.getElementById("outputGoesHere").textContent = object.Chinese;
    }

    xhr.send();
    xhr.onerror = function() {
         alert('Error: Unable to make request');
    };
}
