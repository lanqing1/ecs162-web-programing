const express = require('express');
const passport = require('passport');
const http = require('http');
const sqlite3 = require("sqlite3").verbose();
const APIrequest = require('request');

const port = 57507;
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey
const cmdStr = 'INSERT into Flashcards (user, english,korean, seen, correct) VALUES (1, @0, @1, 0, 0)';
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);

const googleLoginData = {
    clientID: '472036695689-s9n5kubr2kuqftbvk0ujl67i324njo3p.apps.googleusercontent.com',
    clientSecret: 'W-edC3ifbkX9nxSDoNheWPca',
    callbackURL: '/auth/redirect'
};

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
  passport.use( new GoogleStrategy(googleLoginData, gotProfile) );

  const app = express()

  app.use(cookieSession({
      maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
      // meaningless random string used by encryption
      keys: ['hanger waldo mercy dance']  
  }));

  app.use(express.static('public'));
  app.get('/translate', translateHandler );
  app.get('/store',saveHandler);
  app.use( fileNotFound );

  app.listen(port, function (){console.log('Listening...');} )
