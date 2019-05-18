const express = require('express');
const port = 51577;
const APIrequest = require('request');
const http = require('http');
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey
const cmdStr = 'INSERT into Flashcards (user, english,korean, seen, correct) VALUES (1, @0, @1, 0, 0)';
const sqlite3 = require("sqlite3").verbose();
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);

const cmdStrCreate = 'CREATE TABLE Flashcards (user INT,english TEXT, korean TEXT, seen INT, correct INT)';
db.run(cmdStrCreate,tableCreationCallback);
function tableCreationCallback(err) {
  if (err) {
    console.log("Table creation error",err);
  } else {
    console.log("Database created");
    // when to close db if not here?
  }
}
function saveHandler(req,res,next){
  let en = req.query.english;
  let ko = req.query.korean;
  db.run(cmdStr, en, ko, insertCallback);
  //will have duplicated translation in db if click on save mulitiple times
  function insertCallback(err) {
    if (err) { console.log(err);}
  }
  //printout database
  db.all ( 'SELECT * FROM flashcards', dataCallback);
  function dataCallback( err, data ) {console.log(data)}
  res.statusCode = 204;
  res.send();
}
function translateHandler(req, res, next) {
  let word = req.query.word;
  console.log("english: "+word);
  let requestObject = { "source": "en", "target": "ko", "q": [word]};
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
          kor = APIresBody.data.translations[0].translatedText;
          res.json({"English":word,"Korean":kor});
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
  app.use(express.static('public'));
  app.get('/translate', translateHandler );
  app.get('/store',saveHandler);
  app.use( fileNotFound );

  app.listen(port, function (){console.log('Listening...');} )
