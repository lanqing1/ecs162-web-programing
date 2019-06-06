Name, SID, Email
Shih-Chieh Hsiao, 999324839, sjhsiao@ucdavis.edu
Lanqing Cheng, 914955364, lqqcheng@ucdavis.edu
Wyatt Robertson, 913920853, wcrobertson@ucdavis.edu

Creating a database:
    node createDB.js

Running the Server:
    node loginServer.js

Finding the APP on the Internet:
    http://server162.site:51577/login.html

IF already logged in:
    http://server162.site:51577/user/lango.html
    NOTE: If user tries to access http://server162.site:51577/user/lango.html without a cookie,
          user will be directed to http://server162.site:51577/login.html to login instead.

Review Stage:
    If the user has been in our app before, he/she will be directed to review immediately.
    Clicking the "add" button will return the user back to saving stage.

    Clicking on the card will flip the card to show the correct answer.
    Hitting ENTER with the CORRECT answer will show the Correct! sign.
    Hitting Enter with the INCORRECT answer will show the correct answer to user.

    Clicking the "next" button will run the scoring system and find the next card for user to review.

Saving Stage:
    User types English text on the left box and hit ENTER to get Korean translation on the right.
    Clicking on the "save" button will save the card into the database.
    Clicking the "Start Review" button will take the user to the review stage.