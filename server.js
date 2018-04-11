// Dependencies

const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const request = require("request");

// Require all models
var db = require("./models/");

var PORT = 8080;

// Initialize Express
var app = express();

// Configure middleware

// Set Handlebars.

app.engine("handlebars", exphbs({ defaultLayout: "main", extname: "handlebars" }));
app.set("view engine", "handlebars");

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/week18Populater");
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Let's start by scraping data

// console.log(results);

// An empty array to save the data that we'll scrape
let scrapedResults = [];

// make a request call to grab HTML body from the site of your choice
request("https://www.reddit.com/", function (error, response, html) {
    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    const $ = cheerio.load(html);
    // console.log(response);


    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works

    $("p.title").each(function (i, element) {
        let result = {};
        result.title = $(this).children("a").text();
        result.link = $(this).children("a").attr("href");

        db.Article.create(result)
            .then(function (article) {
                // console.log(article)
            })
            .catch(function (err) {
                return res.json(err);
            })

        scrapedResults.push(result);
    });

    // Log the results once you've looped through each of the elements found with cheerio
    // console.log(results);
});

// Let's set up our routes
// when a user visits the homepage...

app.get("/", function (req, res) {
    // go to our collection of Articles in our database and find everything
    db.Article.find({})
        .then(function (articles) {
            // console.log(article);
            let hbsScraped = {
                data: articles
            }
            console.log(hbsScraped.data[5]);
            res.render('index', hbsScraped);

        })
        .catch(function (err) {
            return res.json(err)
        });
});

// A GET route for scraping the echoJS website
// app.get("/scrape", function (req, res) {
// // make a request call to grab HTML body from the site of your choice
// request("https://www.reddit.com/", function (error, response, html) {
//     // Load the HTML into cheerio and save it to a variable
//     // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//     const $ = cheerio.load(html);
//     // console.log(response);


//     // Select each element in the HTML body from which you want information.
//     // NOTE: Cheerio selectors function similarly to jQuery's selectors,
//     // but be sure to visit the package's npm page to see how it works

//     $("p.title").each(function (i, element) {
//         let result = {};
//         result.title = $(this).children("a").text();
//         result.link = $(this).children("a").attr("href");

//         db.Article.create(result)
//             .then(function (article) {
//                 console.log(article)
//             })
//             .catch(function (err) {
//                 return res.json(err);
//             })

//         scrapedResults.push(result);
//     });

//     // Log the results once you've looped through each of the elements found with cheerio
//     // console.log(results);
// });
// });
// console.log(results);



// app.get("/saved", function (req, res) {
//     db.Article.findOne({ "_id": req.params.id })
//         .populate("notes")
//         .then(function (dbArticle) {
//             res.json(dbArticle);
//         })
//     console.log(req);
//     res.render('saved');
// })


// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({}).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        return res.json(err);
    })
});

// // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.findOne({ "_id": req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
});

// Route for saving/updating an Article and its associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // find an article from the req.params.id
    // and update it's saved property to true
    console.log(req.params.id);
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .then(function (article) {
            console.log(article);
            res.redirect('/');
        })
        .catch(function (err) {
            return res.json(err);
        });
});

// Route for getting all saved Articles from the db
app.get("/saved", function (req, res) {
    // TODO: Finish the route so it grabs all of the saved articles
    db.Article.find({})
        .populate('note')
        .then(function (saved) {
            console.log(saved);
            let hbsSaved = {
                data: saved
            }
            res.render('saved', hbsSaved);
        })
        .catch(function (err) {
            return res.json(err);
        })
});

// Route for creating saving a note and its associated Note
app.post("/saved/:id", function (req, res) {
    // TODO
    // ====
    // find an article from the req.params.id
    // and update it's saved property to true
    console.log(req.params.id);
    db.Note.create(req.body)
        .then(function (note) {
            console.log(note);
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: note }, { new: true })
            res.redirect('/saved');
        })
        .catch(function (err) {
            return res.json(err);
        });
});


// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function (req, res) {
//     // TODO
//     // ====
//     // save the new note that gets posted to the Notes collection
//     // then find an article from the req.params.id
//     // and update it's "note" property with the _id of the new note
//     db.Note.create(req.body)
//         .then(function (dbNote) {
//             console.log(dbNote);
//             return db.Article.findOne({ _id: req.params.id }, { $push: { note: dbNote } });
//         }).
//         then(function (dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             res.json(err);
//         })

// });


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
