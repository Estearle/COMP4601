const express = require('express');
const app = express();
const Page = require("./Page.js");
const Game = require("./Game.js");
const elasticlunr = require("elasticlunr");
const mongoose = require('mongoose');
const { connect, Types } = mongoose;
//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files
const ROOT_DIR_CSS = '/public/css'; //root directory for css files

const path = require('path');
const url = require('url');

app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server
app.use(express.static(__dirname + ROOT_DIR_CSS)) //provide static server

let fruitResult;
//convert JSON stringified strings in a POST request to JSON
app.use(express.json());
app.set('views', './views')
app.set('view engine', 'pug')

//Create your index
//index string
const fruitIndex = elasticlunr(function () {
    this.addField('title');
    this.addField('content');
    this.setRef('title');
});


app.get("/fruits", async (req, res) => {
    let q = req.query.q;
    // boost default is false
    let boost = req.query.boost || "false";
    let limit = req.query.limit ;
    let searchResult;

    console.log(q, boost, limit)

    // Limit can only be [1,50], default = 10 
    if(typeof limit === "undefined"){
        limit = 10;
        console.log(limit)
    }
    else{
        if(Number(limit)){
            limit = Number(limit);
            if(limit >= 1 && limit <= 50){}
            else{ res.status(404).json({error:"limit out of bound"})}
        }
    }
    // search for string (q)
    if (typeof q !== "undefined") {
        // (1) q (string) + boost (false)
        if (boost === "false") {
            searchResult = fruitIndex.search(q, {});
        }
        // (2) q (string) + boost(true)
        else if (boost === "true") {
            let elasticResult = fruitIndex.search(q, {});
            searchResult = await Promise.all(elasticResult.map(async (obj) => {
                // console.log(obj.ref);
                let ref = await Page.findOne({ "title": obj.ref });
                let updatedScore = ref.pageRank * obj.score;
                return {
                    result: ref.toObject(),
                    score: updatedScore
                }
            }))
            searchResult.sort(function (a, b) { return b.score - a.score });
        }
        
        //If a valid limit parameter X is specified, your server MUST return X results, even if all documents have a score of 0 (return any X documents in this case).
        if(searchResult.length < limit){
            searchResult = fruitResult;
        }
    }
    else {
        // (3)boost (true)
        // Same thing as populating Top PageRank (Lab 5)
        if (boost === "true") {
            fruitResult = await Page.find({}, 'title').sort({ 'pageRank': -1 });
            searchResult = fruitResult.map(obj => obj.toObject());
        }

    }

    // return limit(if typed) or 10(default)
    searchResult = searchResult.slice(0, limit);
})

app.get("/personal", (req, res) => {

})



// Create an async function to load the data.
// Other mongoose calls that return promise (connect) 
// inside the async function can use an await.
const loadData = async () => {

    //Connect to the mongo database
    const result = await connect('mongodb://localhost:27017/A1');

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
    .then(async () => {
        //Add all documents to the index 
        fruitResult = await Page.find({});
        fruitResult.forEach(function (page) {
            fruitIndex.addDoc(page.toObject());
        })
    })
    .catch(err => console.log(err));