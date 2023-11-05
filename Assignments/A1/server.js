const express = require('express');
const app = express();
const Page = require("./Page.js");
const Game = require("./Game.js");
const elasticlunr = require("elasticlunr");
const natural = require('natural');
const mongoose = require('mongoose');
const { connect, Types } = mongoose;
//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files
const ROOT_DIR_CSS = '/public/css'; //root directory for css files

const path = require('path');
const url = require('url');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server
app.use(express.static(__dirname + ROOT_DIR_CSS)) //provide static server

let fruitResult, gameResult;
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

const personalIndex = elasticlunr(function () {
    this.addField('title');
    this.addField('categories');
    this.addField('description');
    this.setRef('title');
})

app.get("/search", async(req, res) => {
    res.render("search",{});
})

app.get("/", async(req, res) => {
    res.render("search",{});
})

const tokenizer = new natural.WordTokenizer();
const stopWords = new Set(['the', 'and', 'is', 'in', 'it', 'by', 'so']);

// Function to tokenize and filter out stop words
function tokenizeAndFilter(text) {
    return tokenizer
      .tokenize(text)
      .map(word => word.toLowerCase())
      .filter(word => !stopWords.has(word) && word.length > 1);
}

// Function to count word frequencies in a text
function countWordFrequencies(text) {
    const wordCounts = tokenizeAndFilter(text).reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
    return Object.keys(wordCounts).map(word => ({ word, frequency: wordCounts[word] }));
}

app.get("/detail/:title", async(req, res) => {
    let title = req.params.title;
    try {
        let game = await Game.findOne({ title: title });
        let fruit = await Page.findOne({ title: title });
        if (game) {
            let wordFrequencies = countWordFrequencies(game.title + " " + game.categories.join(" ") + " " + game.description.join(" "));
            let details = {
                url: game.link,
                title: game.title,
                incomingLinks: game.incoming,
                outgoingLinks: game.fanAlsoLike,
                wordFrequencies: wordFrequencies
            };
            res.render('detail',{details: details});
        } else if (fruit) {
            let wordFrequencies = countWordFrequencies(fruit.title + " " + fruit.content.join(" "));
            let details = {
                url: fruit.link,
                title: fruit.title,
                incomingLinks: fruit.incoming,
                outgoingLinks: fruit.outgoing,
                wordFrequencies: wordFrequencies
            };
            res.render('detail',{details: details});
        } else {
            res.status(404).json({ error: "Page not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.get("/fruits", async (req, res) => {
    let q = req.query.q;
    // boost default is false
    let boost = req.query.boost || "false";
    let limit = req.query.limit;
    let searchResult;

    console.log(q, boost, limit)

    // Limit can only be [1,50], default = 10 
    if (typeof limit === "undefined") {
        limit = 10;
        console.log(limit)
    }
    else {
        if (Number(limit)) {
            limit = Number(limit);
            if (limit >= 1 && limit <= 50) { }
            else { res.status(404).json({ error: "Limit out of bounds" }) }
        }
    }

    // search for string (q)
    if (typeof q !== "undefined") {
        let elasticResult = fruitIndex.search(q, {});
        // (1) q (string) + boost (false)
        if (boost === "false") {
            searchResult = await Promise.all(elasticResult.map(async (obj) => {
                let ref = await Page.findOne({ "title": obj.ref }).lean(); // Use lean() for performance if you just need the JSON data
                return {
                    name: "Earle Estrella, Rachel Wong",
                    url: ref.link,
                    score: obj.score,
                    title: ref.title,
                    pr: ref.pageRank
                };
            }));
        }
        // (2) q (string) + boost(true)
        else if (boost === "true") {   
            searchResult = await Promise.all(elasticResult.map(async (obj) => {
                // console.log(obj.ref);
                let ref = await Page.findOne({ "title": obj.ref });
                let updatedScore = ref.pageRank * obj.score;
                return {
                    name: "Earle Estrella, Rachel Wong",
                    url: ref.link,
                    score: updatedScore,
                    title: ref.title,
                    pr: ref.pageRank
                };
            }))
            searchResult.sort(function (a, b) { return b.score - a.score });
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
    if (searchResult.length > limit) {
        searchResult = searchResult.slice(0, limit);
    }
    else {
        //If a valid limit parameter X is specified, your server MUST return X results, even if all documents have a score of 0 (return any X documents in this case).
        if (searchResult.length < limit) {
            let count = limit - searchResult.length;
            let ref = searchResult.map(result =>result.ref);
            for( let i = 0 ;i < count ; i++){
                let cur = fruitResult[i];
                if(!ref.includes(cur)){
                    searchResult.push({
                        name: "Earle Estrella, Rachel Wong",
                        url: cur.url, // Populate URL
                        score: 0, // Set score as needed
                        title: cur.title,
                        pr: cur.pageRank
                    });
                }
            }
        }
    }

    // Check the type of response to send
    if (req.accepts('html')) {
        res.render('searchResults', { searchResults: searchResult });
    } else if (req.accepts('json')) {
        res.json(searchResult);
    }
})

app.get("/personal", async (req, res) => {
    let q = req.query.q;
    // boost default is false
    let boost = req.query.boost || "false";
    let limit = req.query.limit;
    let searchResult;

    console.log(q, boost, limit)

    // Limit can only be [1,50], default = 10 
    if (typeof limit === "undefined") {
        limit = 10;
    }
    else {
        if (Number(limit)) {
            limit = Number(limit);
            if (limit >= 1 && limit <= 50) { }
            else { res.status(404).json({ error: "limit out of bound" }) }
        }
    }
    // search for string (q)
    if (typeof q !== "undefined") {
        let elasticResult = personalIndex.search(q, {});
        // (1) q (string) + boost (false)
        if (boost === "false") {
            searchResult = await Promise.all(elasticResult.map(async (obj) => {
                let ref = await Game.findOne({ "title": obj.ref }).lean(); // Use lean() for performance if you just need the JSON data
                return {
                    name: "Earle Estrella, Rachel Wong",
                    url: ref.link,
                    score: obj.score,
                    title: ref.title,
                    pr: ref.pageRank
                };
            }));
        }
        // (2) q (string) + boost(true)
        else if (boost === "true") {
            console.log("(2) q (string) + boost(true)");
            searchResult = await Promise.all(elasticResult.map(async (obj) => {
                // console.log(obj.ref);
                let ref = await Game.findOne({ "title": obj.ref });
                let updatedScore = ref.pageRank * obj.score;
                return {
                    name: "Earle Estrella, Rachel Wong",
                    url: ref.link,
                    score: updatedScore,
                    title: ref.title,
                    pr: ref.pageRank
                };
            }))
            searchResult.sort(function (a, b) { return b.score - a.score });
        }
    }
    else {
        // (3)boost (true)
        // Same thing as populating Top PageRank (Lab 5)
        if (boost === "true") {
            console.log("(3)boost (true)");
            gameResult = await Game.find({}, 'title').sort({ 'pageRank': -1 });
            searchResult = gameResult.map(obj => obj.toObject());
        }
    }

    // return limit(if typed) or 10(default)
    if (searchResult.length > limit) {
        searchResult = searchResult.slice(0, limit);
    }
    else {
        //If a valid limit parameter X is specified, your server MUST return X results, even if all documents have a score of 0 (return any X documents in this case).
        if (searchResult.length < limit) {
            let count = limit - searchResult.length;
            let ref = searchResult.map(result =>result.ref);
            for( let i = 0 ;i < count ; i++){
                let cur = gameResult[i];
                if(!ref.includes(cur)){
                    searchResult.push({
                        name: "Earle Estrella, Rachel Wong",
                        url: cur.link, // Populate URL
                        score: 0, // Set score as needed
                        title: cur.title,
                        pr: cur.pageRank
                    });
                }
            }
        }
    }

    // Check the type of response to send
    if (req.accepts('html')) {
        res.render('searchResults', { searchResults: searchResult });
    } else if (req.accepts('json')) {
        res.json(searchResult);
    }
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
    .then(async () => {
        //Add all documents to the index 
        fruitResult = await Page.find({});
        fruitResult.forEach(function (page) {
            fruitIndex.addDoc(page.toObject());
        })

        gameResult = await Game.find({});
        gameResult.forEach(function (game) {
            personalIndex.addDoc(game.toObject());
        })
    })
    .then(() => {
        app.listen(PORT);
        console.log("Listen on port:", PORT);

    })
    .catch(err => console.log(err));