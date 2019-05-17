// Globals
//const APIrequest = require('request');
//const http=require('http');
const fs = require("fs"); // file system

const sqlite3 = require("sqlite3").verbose();  // use sqlite
const dbFileName = "Flashcards.db";
const db = new sqlite3.Database(dbFileName);
//var langoServer = http.createServer(translateHandler);

// Initialize table.
// If the table already exists, causes an error.
// Fix the error by removing or renaming Flashcards.db
const cmdStr = 'CREATE TABLE Flashcards (user INT,english TEXT, korean TEXT, seen INT, correct INT)';
db.run(cmdStr,tableCreationCallback);

// Always use the callback for database operations and print out any
// error messages you get.
// This database stuff is hard to debug, give yourself a fighting chance.
function tableCreationCallback(err) {
  if (err) {
    console.log("Table creation error",err);
  } else {
    console.log("Database created");
    db.close();
  }
}
