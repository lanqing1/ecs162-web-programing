const express = require('express');
const passport = require('passport');
const http = require('http');
const sqlite3 = require("sqlite3").verbose();
const APIrequest = require('request');
const GoogleStrategy = require('passport-google-oauth20');
const cookieSession = require('cookie-session');

const port = 57507;
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey
const cmdStr = 'INSERT into Flashcards (user, english,korean, seen, correct) VALUES (1, @0, @1, 0, 0)';
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);

const googleLoginData = {
    clientID: '535090601087-2arfflfn8a5sl4avr05kqgb6j00d8ln7.apps.googleusercontent.com',
    clientSecret: '8Iag1z4KGnaFt1pBZoBK_Wdb',
    callbackURL: '/auth/redirect'
};

function isAuthenticated(req, res, next) {
  if (req.user) {
    console.log("Req.session:", req.session);
    console.log("Req.user:", req.user);
    next();
  } else {
    res.redirect('/login.html');
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

function gotProfile(accessToekn, refreshToken, profile, done) {
  console.log("Google profile", profile);
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there. 
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.

  let dbRowID = 1;
  done(null, dbRowID);
}

  // put together the server pipeline
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );

const app = express()

app.use(cookieSession({
    maxAge: 6 * 60 * 60 * 1000, // Six hours in milliseconds
    // meaningless random string used by encryption
    keys: ['hanger waldo mercy dance']  
}));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call deserializeUser()
app.use(passport.session()); 

app.use(express.static('public'));

app.get('/auth/google',passport.authenticate('google',{ scope: ['profile'] }) );
app.get('/auth/redirect',
  function (req, res, next) {
    console.log("at auth/redirect");
    next();
  },

  // This will issue Server's own HTTPS request to Google
  // to access the user's profile information with the 
  // temporary key we got in the request. 
  passport.authenticate('google'),

  // then it will run the "gotProfile" callback function,
  // set up the cookie, call serialize, whose "done" 
  // will come back here to send back the response
  // ...with a cookie in it for the Browser!
  function(req, res) {
    console.log('Logged in and using cookies!')
    res.redirect('/public/lango.html');
  }
);

app.get('/public/*',
  isAuthenticated,
  express.static(".")
);

app.get('/translate', translateHandler );
app.get('/store',saveHandler);

app.use( fileNotFound );

app.listen(port, function (){console.log('Listening...');} )

// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie. 
// Where we should lookup user database info. 
// Whatever we pass in the "done" callback becomes req.user
// and can be used by subsequent middleware.
passport.deserializeUser((dbRowID, done) => {
    console.log("deserializeUser. Input is:", dbRowID);
    // here is a good place to look up user data in database using
    // dbRowID. Put whatever you want into an object. It ends up
    // as the property "user" of the "req" object. 
    let userData = {userData: "data from db row goes here"};
    done(null, userData);
});