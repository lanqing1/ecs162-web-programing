const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const port = 51577;
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
    clientID: '126866001304-qig4ann5br35gtl9usruhjprhq0o1bq6.apps.googleusercontent.com',
    clientSecret: 'Twi-FaKacJBnVlxS_48wOj8I',
    callbackURL: redirectURL
};

passport.use( new GoogleStrategy(googleLoginData, gotProfile) );

const app = express();
app.use('/', printURL);// pipeline stage that just echos url, for debugging

app.use(cookieSession({ // Check validity of cookies at the beginning of pipeline
    maxAge: 6 * 60 * 60 * 1000, 
    keys: ['hanger waldo mercy dance'] 
}));

// Initializes request object for further handling by passport
app.use(passport.initialize());
// If there is a valid cookie, will call deserializeUser()
app.use(passport.session());
// Public static files
app.get('/*',express.static('public'));

app.get('/auth/google', passport.authenticate('google',{ scope: ['profile'] }) );

app.get(redirectURL,
	// for educational purposes
	function (req, res, next) {
	    console.log("at auth/accepted");
	    next();
    },
	
    passport.authenticate('google'),    
	function (req, res) {
	    console.log('Logged in and using cookies!')
        res.redirect('/user/lango.html');
        res.send(flag);
	});

// static files in /user are only available after login
app.get('/user/*',
	isAuthenticated, 
	express.static('.')
       );
// next, all queries (like translate or store or get...

app.get(express.static('user'));
app.get('/user/translate', translateHandler );
app.get('/user/store', saveHandler);
app.get('/user/query', function (req, res) {  res.send(req.user);});
app.get('/user/getcards',getData);
app.get('/user/seen',function(req,res){
    let id = req.user.id
    let en = req.query.english;
    db.get( 'SELECT * FROM Flashcards WHERE english = ? AND user = ?',[en,id], tableSearchCallback);
    function tableSearchCallback( err, row,done) {
        if(err){throw err;}
        if(row){
            let seen = row.seen+1;
            console.log("before updated:",row)
            console.log("updated seen: ",seen);
            db.run('UPDATE Flashcards SET seen = '+seen+' Where english = ? AND user = ?',[en,id]);
            done;
        }       
    }
    res.statusCode=204;
    res.send();
});

app.get('/user/correct',function(req,res){
    let id = req.user.id
    let en = req.query.english;
    db.get( 'SELECT * FROM Flashcards WHERE english = ? AND user = ?',[en,id], tableSearchCallback);
    function tableSearchCallback( err, row,done) {
        if(err){throw err;}
        if(row){
            let correct = row.correct+1;
            console.log("before updated:",row)
            console.log("updated correct: ",correct);
            db.run('UPDATE Flashcards SET correct = '+correct+' Where english = ? AND user = ?',[en,id]);
            done;
        }       
    }
    res.statusCode=204;
    res.send();
});


// finally, not found...applies to everything
app.use( fileNotFound );

// Pipeline is ready. Start listening!
app.listen(port, function (){console.log('Listening...');} );

function getData(req,res){
    let id = req.user.id;
    let cmdStr ='SELECT * FROM Flashcards WHERE user ='+id;
    db.all(cmdStr,(err,arrayData) =>{
        if(err){console.error(err.message);
        }else{
            res.send(arrayData);
        }
    });
}
// middleware functions
function saveHandler(req,res){

    let en = req.query.english;
    let ko = req.query.korean;
    let id = req.user.id;
    db.get( 'SELECT * FROM Flashcards WHERE english = ?', [en], tableSearchCallback);
    function tableSearchCallback( err, row,done) {
        if(err){throw err;}
        if(row){
            //if already exist-> print out
            console.log(row);
            done;
        }else{
            //insert into table        
            let cmdStr = 'INSERT into Flashcards (user, english,korean, seen, correct) VALUES (?, ?, ?, 0, 0)';
            db.run(cmdStr,[id ,en, ko], function(err){if(err){console.log(err);}}); 
            done;              
        }        
    }
    //printout database
    db.all ( 'SELECT * FROM flashcards', function(data ) {console.log(data)});
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
    console.log("isAutenticated function~\n");
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


function gotProfile(accessToken, refreshToken, profile, done) {

    let object = profile._json;
    let firstname = object.given_name;
    let lastname = object.family_name;
    let dbRowID = object.sub;

    db.get( 'SELECT ? FROM UserInfo WHERE googleID = ?', [dbRowID], tableSearchCallback);
    function tableSearchCallback( err, row ) {
        if(err){throw err;}
        if(row){
            let userData = {id:row.googleID,name: row.firstname};
            done(null, userData);
        }else {//insert user info into table     
                
            let cmdStr = 'INSERT INTO UserInfo (googleID ,firstname, lastname) VALUES (?,?,?)';
            db.run(cmdStr ,dbRowID ,firstname,lastname);
            done(null,dbRowID);
           }        
    }
}

passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});


passport.deserializeUser((dbRowID, done) => {
    console.log("deserializeUser. Input is:", dbRowID);
    let cmdStr ='SELECT * FROM UserInfo WHERE googleID = ? ';
    db.get(cmdStr,[dbRowID],(err,row) =>{
        if(err){return console.error(err.message);}
        if(row){
            let userData = {
                id:dbRowID,
                name: row.firstname
                };
            done(null, userData);

        }else{
            console.error("what's going on?I'm not supposed to be here!");
            done(null,null);
        }
    });
    
});
// Close database on exiting the terminal
process.on('exit', function(){db.close();}); 
