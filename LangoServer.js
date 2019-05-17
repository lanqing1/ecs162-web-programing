const express = require('express');
const port = 51577;
const APIrequest = require('request');
const http = require('http');
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";  // ADD API KEY HERE
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey

function queryHandler(req, res, next) {
  let word = req.query.word;
  console.log("english: "+word);
  let requestObject = { "source": "en", "target": "zh-CN", "q": [word]};
  if(word!=undefined){
    function APIcallback(err, APIresHead, APIresBody) {
      if ((err) || (APIresHead.statusCode != 200)) {
        console.log("err="+err);
        console.log("status="+APIresHead.statusCode);

        console.log("Got API error");
        console.log(requestObject);
        console.log(APIresBody);
      } else {
        if (APIresHead.error) {
          console.log(APIresHead.error);
        } else {
          res.json({"English":word,
          "Korean":APIresBody.data.translations[0].translatedText});
	   console.log(res.json);
        //  console.log(JSON.stringify(res, undefined, 2));
        }
      }
    }
    APIrequest(
      { // HTTP header stuff
        url: url,
        method: "POST",
        headers: {"content-type": "application/json"},
        json: requestObject	},
        APIcallback
      );
    }else {
      next();
    }
  }

  function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find '+url);
  }

  // put together the server pipeline
  const app = express()
  app.use(express.static('public'));  // can I find a static file?
  app.get('/query', queryHandler );   // if not, is it a valid query?
  app.use( fileNotFound );            // otherwise not found

  app.listen(port, function (){console.log('Listening...');} )
