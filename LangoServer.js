const express = require('express');
const port = 51577;
const APIrequest = require('request');
const http = require('http');
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey
// can translate and put data into res
//need to add storeHandler
function translateHandler(req, res, next) {
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
          "Chinese":APIresBody.data.translations[0].translatedText});
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

//may need to change app.get(..)
  const app = express()
  app.use(express.static('public'));
  app.get('/query', translateHandler );
  app.use( fileNotFound );

  app.listen(port, function (){console.log('Listening...');} )
