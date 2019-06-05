const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const port = 57507;
const GoogleStrategy = require('passport-google-oauth20');
const redirectURL = '/auth/accepted';

const APIrequest = require('request');
const APIkey = "AIzaSyDmEaUmKwepuvcQM_T3vijxo02qBzrp1oU";
const url = "https://translation.googleapis.com/language/translate/v2?key="+APIkey

const sqlite3 = require("sqlite3").verbose();
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);

// a redirect response that redirects to server162.site:[port]/auth/accepted
const googleLoginData = {
    clientID: '535090601087-2arfflfn8a5sl4avr05kqgb6j00d8ln7.apps.googleusercontent.com',
    clientSecret: '8Iag1z4KGnaFt1pBZoBK_Wdb',
    callbackURL: redirectURL
};

// Strategy configuration.
// Tell passport we will be using login with Google, and
// give it our data for registering us with Google.
// The gotProfile callback is for the server's HTTPS request
// to Google for the user's profile information.
// It will get used much later in the pipeline.
passport.use( new GoogleStrategy(googleLoginData, gotProfile) );


// Let's build a server pipeline!
// app is the object that implements the express server
const app = express();
app.use('/', printURL);// pipeline stage that just echos url, for debugging

app.use(cookieSession({ // Check validity of cookies at the beginning of pipeline
    maxAge: 6 * 60 * 60 * 1000, // Six hours in msec
    keys: ['hanger waldo mercy dance'] 
}));

// Initializes request object for further handling by passport
app.use(passport.initialize());
// If there is a valid cookie, will call deserializeUser()
app.use(passport.session());
// Public static files
app.get('/*',express.static('public'));

//object { scope: ['profile'] } ask Google for user profile information.
//redirect to Google from login page.
app.get('/auth/google', passport.authenticate('google',{ scope: ['profile'] }) );
// passport.authenticate sends off the 302 response

// Google redirects here after user successfully logs in
// This route has three handler functions, one run after the other.
app.get(redirectURL,
	// for educational purposes
	function (req, res, next) {
	    console.log("at auth/accepted");
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
	function (req, res) {
	    console.log('Logged in and using cookies!')
        res.redirect('/user/lango.html');
	});

// static files in /user are only available after login
app.get('/user/*',
	isAuthenticated, // only pass on to following function if
	// user is logged in
	// serving files that start with /user from here gets them from ./
	express.static('.')
       );

// next, all queries (like translate or store or get...

app.get(express.static('user'));
app.get('/user/translate', translateHandler );
app.get('/user/store', saveHandler);
app.get('/user/query', function (req, res) {  res.send(req.user);});

// finally, not found...applies to everything
app.use( fileNotFound );

// Pipeline is ready. Start listening!
app.listen(port, function (){console.log('Listening...');} );


// middleware functions
function saveHandler(req,res,next){

    let en = req.query.english;
    let ko = req.query.korean;
    let user = req.user;
    console.log(user);
    let cmdStr = 'INSERT into Flashcards (user, english,korean, seen, correct) VALUES (?, ?, ?, 0, 0)';
    db.run(cmdStr,2 ,en, ko, insertCallback);
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


// print the url of incoming HTTP request
function printURL (req, res, next) {
    console.log(req.url);
    next();
}

// function to check whether user is logged when trying to access
// personal data
function isAuthenticated(req, res, next) {
    if (req.user) {
	//console.log("Req.session:",req.session);
	//console.log("Req.user:",req.user);
    console.log("Req: ", req)
	next();
    } else {
	res.redirect('/login.html');  // send response telling
	// Browser to go to login page
    }
}


// function for end of server pipeline
function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find '+url);
    }

// Some functions Passport calls, that we can use to specialize.
// This is where we get to write our own code, not just boilerplate.
// The callback "done" at the end of each one resumes Passport's
// internal process.

// function called during login, the second time passport.authenticate
// is called (in /auth/redirect/),
// once we actually have the profile data from Google.
function gotProfile(accessToken, refreshToken, profile, done) {

    // Second arg to "done" will be passed into serializeUser,
    // should be key to get user out of database.
    let object = profile._json;
    let firstname = object.given_name;
    let lastname = object.family_name;
    let dbRowID = object.sub;
    //check if user is in DB,store him in DB if not already there.
    db.get( 'SELECT ? FROM UserInfo WHERE googleID = ?', [dbRowID], tableSearchCallback);
    function tableSearchCallback( err, row ) {
        if(err){throw err;}
        if(row){
            let userData = {google_id:row.googleID,name: row.firstname};
            done(null, userData);
        }else {//insert user info into table         
            let cmdStr = 'INSERT INTO UserInfo (googleID ,firstname, lastname) VALUES (?,?,?)';
            db.run(cmdStr ,dbRowID ,firstname,lastname);
            /*
            let userData = {google_id:dbRowID,name: firstname};
            done(null, userData);
            */
            done(null,dbRowID);
            //print out to see data
            /*
            db.all ( 'SELECT * FROM UserInfo', dataCallback);            
            function dataCallback( err, data ) {
                if(err){console.log(err);}
                console.log("print data from gotProfile",data);
            }   
            */
        }        
    }
}

// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
    //do we need to get data from db here and call done(null,userData)???
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

    let cmdStr ='SELECT * FROM UserInfo WHERE googleID = ? ';
    db.get(cmdStr,[dbRowID],(err,row) =>{
        if(err){return console.error(err.message);}
        if(row){
            let userData = {
                google_id:dbRowID,
                name: row.firstname
                };
            //console.log("-----------\n",userData);
            done(null, userData);

        }else{
            console.error("what's going on?I'm not supposed to be here!");
        }
    });
    
});
