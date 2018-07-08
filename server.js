var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/gamespotNews";

// Connect Mongoose to db
mongoose.connect(MONGODB_URI, function (error) {
    // Log any errors connection with mongoose
    if (error) {
        console.log(error);
    }
    // or log a success message
    else {
        console.log("mongoose connection is successfull");
    }
});
// Import routes and give the server access to them.
var routes = require("./controllers/controller.js");

app.use(routes);


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
