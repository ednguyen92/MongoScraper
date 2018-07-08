var express = require('express');
var router = express.Router();
var path = require('path');

// Our scraping tools
var request = require('request');
var cheerio = require("cheerio");

// Require all models
var Article = require("../models/Article.js");
var Note = require("../models/Note.js");
// Routes

// A GET route for scraping the echoJS website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.gamespot.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.summary = $(this)
        .children("a")
        .children(".media-body")
        .children("p")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.redirect('/');
  });
});

// Route for getting all Articles from the db
router.get("/", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render('index', {
        dbArticle: dbArticle
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//clear all articles
router.get("/clearAll", function(req, res) {
  // Grab every document in the Articles collection
  Article.remove({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.redirect('/');
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.post("/saved/:id", function(req, res) {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: true})
  .populate("note")
  .then(function(dbArticle) {
    res.redirect('/');
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

router.post("/unsaved/:id", function(req, res) {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: false})
  .then(function(dbArticle) {
    res.redirect('/savedarticles');
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Route for getting all Articles from the db
router.get("/savedarticles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({saved: true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render('articles', {
        dbArticle: dbArticle
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Articles from the db
router.get("/savednotes", function(req, res) {
  // Grab every document in the Articles collection
  Note.find({ _id: req.params.id })
    .then(function(dbNote) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbNote, {
        dbNote: dbNote
      });  

    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

  
  module.exports = router;