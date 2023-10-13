const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const Page = require("./Page.js");
const mongoose = require('mongoose');
const { connect, Types } = mongoose;
const elasticlunr = require("elasticlunr");
//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files

const path = require('path');
const url = require('url');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server

//convert JSON stringified strings in a POST request to JSON
app.use(express.json());
app.set('views', './views')
app.set('view engine', 'pug')


//Create your index
//Specify fields you want to include in search
//Specify reference you want back (i.e., page ID)
const index = elasticlunr(function () {
    this.addField('title');
    this.addField('content');
    this.setRef('title');
});
//homepage
app.get('/',(req,res)=>{
    res.render("pages/home",{});
})

app.get('/search',(req,res)=>{
    res.render("pages/search",{});
})

app.post('/search',async(req,res)=>{
    console.log("searching");
    let text = req.body.text;
    console.log(text);
    let result = await index.search(text,{});
    console.log(result);
    res.json(result);
})

app.get('/popular', async (req, res) => {
  try {
      let popularPages = await Page.aggregate([
          {
              $project: { 
                  link: 1, 
                  incomingLength: { $size: "$incoming" }
              }
          },
          { $sort: { incomingLength: -1 } },
          { $limit: 10 }
      ]);

      res.json(popularPages);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching popular pages." });
  }
});

app.get('/page/:number', async (req, res) => {
  try {
      const number = req.params.number;  // Get the number from the request
      const linkRegex = new RegExp(`N-${number}.html$`);

      // Query the database for the page using the number in the link
      const page = await Page.findOne({ link: { $regex: linkRegex } }).select('link incoming');

      if (!page) {
          return res.status(404).json({ error: 'Page not found.' });
      }

      // Return the relevant information
      res.json({
          link: page.link,          // URL of the page
          incoming: page.incoming   // List of pages that link to this page
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching page information." });
  }
});



// Create an async function to load the data.
// Other mongoose calls that return promise (connect) 
// inside the async function can use an await.
const loadData = async () => {
	
	//Connect to the mongo database
  	const result = await connect('mongodb://localhost:27017/lab3');

    return result;

};

// Call to load the data.
// Once the loadData Promise returns the express server will listen.
// Any errors from connect, dropDatabase or create will be caught 
// in the catch statement.
loadData()
  .then(() => {

    app.listen(PORT);
    console.log("Listen on port:", PORT);

  })
  .then(async ()=>{
    //Add all documents to the index 
    let result = await Page.find({});
    result.forEach(function(page){
        index.addDoc(page.toObject());

    })
    // console.log("TESTING");
    // console.log(index.search("banana apple banana banana banana peach peach pear apple coconut pear peach pear peach pear banana peach peach banana apple banana pear pear peach peach pear",{}))
  
})
  .catch(err => console.log(err));

