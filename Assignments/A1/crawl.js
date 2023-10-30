const Crawler = require("crawler");
const url = require("url");
const { connect, connection } = require('mongoose');
const Page = require("./Page.js");
const Game = require("./Game.js")
const { Matrix } = require("ml-matrix");
const { MongoClient, ObjectId } = require('mongodb');

//store visited page 
let visited = ['https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html'];
let page = [];

//page rank variables 
let adjacent, x0;
let alpha = 0.1;
let CONVERGENCE_THRESHOLD = 0.0001;


const c = new Crawler({
    maxConnections: 7,
    rateLimit: 100,
    retryTimeout: 5000,
    retries: 3,


    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;
            let links = $("a");
            let urlLink = res.request.uri.href;
            let title = urlLink.split('/').pop().split(".")[0];
            let outgoing = [];

            // create if it doesn't exist
            if (!page[urlLink]) {
                page[urlLink] = { "title": title, link: urlLink, "outgoing": [], "incoming": [], content: [$("p").text()],"pagerank":0 };
            }
            else {
                // add content
                if (page[urlLink].content.length === 0) {
                    page[urlLink].content.push($("p").text());
                }
            }

            $(links).each(function (i, link) {
                // Resolve URLs
                href = url.resolve(res.request.uri.href, $(link).attr('href'));
                //push all the outgoing links into the array
                outgoing.push(href)

                //create if it doesn't exist
                if (!page[href]) {
                    page[href] = { "title": $(link).text(), "link": href, "outgoing": [], "incoming": [], content: [],"pagerank":0 };
                }

                page[href].incoming.push(urlLink);
                // console.log($(link).text() + ':  ' + $(link).attr('href')+"\n");

                // Add new links to the queue if they haven't been visited yet
                if (!visited.includes(href)) {
                    visited.push(href);
                    c.queue(href);

                }
            });
            page[urlLink].outgoing = outgoing

        }
        done();
    }
});

c.on('drain', function () {
    console.log("Done.");
    //This gives you a 'client' object that you can use to interact with the database
    const loadData = async () => {
        //Connect to the mongo database.
        await connect('mongodb://localhost:27017/A1');

        //Remove database and start anew.
        await connection.dropDatabase();
        let obj = Object.values(page).map(p => new Page(p));

        await Page.create(obj);

    }

    //Call to load the data.
    //Once the loadData Promise returns it will close the database
    //connection.  Any errors from connect, dropDatabase or create
    //will be caught in the catch statement.
    loadData()
        .then(async () => {
            let resultingMatrix;
            let result = await Page.find({});
            let len = result.length;
            adjacent = Matrix.zeros(len, len);
            //Initial PageRank vector
            x0 = Matrix.eye(1, len).fill(1 / len);
            // 1/N matrix
            m = Matrix.ones(len, len).mul(1 / len);

            // Define a mapping from titles to indices
            let titleToIndex = {};
            result.forEach((document, index) => {
                titleToIndex[document.title.split('-')[1]] = index;
            });

            // Adjusted adjacency matrix filling
            for (let document of result) {
                let curPage = document.title.split('-')[1];
                let outgoing = document.outgoing;
                for (let o of outgoing) {
                    let title = o.split('-').pop().split(".")[0];
                    adjacent.set(titleToIndex[curPage], titleToIndex[title], 1);
                }
            }


            //divide each 1 by the number of 1s in that row
            for (let i = 0; i < len; i++) {
                let count = 0;
                for (let j = 0; j < len; j++) {
                    let val = adjacent.get(i, j);
                    if (val === 1) {
                        count++;
                    }
                }

                //If a row in the adjacency matrix has no 1s, replace each element by 1/N
                if (count === 0) {
                    for (let j = 0; j < len; j++) {
                        adjacent.set(i, j, 1 / len);
                    }
                    continue;
                }

                //divide each 1 by the number of 1s in that row
                for (let j = 0; j < len; j++) {
                    let val = adjacent.get(i, j);
                    if (val === 1) {
                        adjacent.set(i, j, 1 / count);
                    }
                }

            }

            // console.log(adjacent)
            resultingMatrix = adjacent.mul(1 - alpha).add(m.mul(alpha));
            // console.log(adjacent.mul(1-alpha));
            // console.log(m.mul(alpha))
            // console.log(resultingMatrix)
            let pageRankVector = computePageRank(resultingMatrix, x0);
            console.log('PageRank Values:', pageRankVector);

            // Create an array of { title, rank } objects for display purposes
            let rankedPages = [];
            let pageRankArray = pageRankVector.to1DArray();
            for (let i = 0; i < result.length; i++) {
                const searchResult = await Page.updateOne({"title":result[i].title},{$set:{"pageRank":pageRankArray[i]}});
                rankedPages.push({
                    title: result[i].title,
                    rank: pageRankArray[i]
                });
            }

            rankedPages.sort((a, b) => b.rank - a.rank);

            let top25 = rankedPages.slice(0, 25);
            console.log("Top 25 Pages by PageRank:");
            console.table(top25);
        })


        .then((result) => {
            console.log("Closing database connection.");
            connection.close();
        })
        .catch(err => console.log(err));
});


c.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');


//Page Rank Calculation
let computePageRank = (transitionMatrix, initialVector) => {
    let currentVector = initialVector;
    let iterationCount = 0;

    while (true) {
        let previousVector = currentVector;

        currentVector = previousVector.mmul(transitionMatrix);

        // Normalize currentVector to prevent floating-point inaccuracies
        let sum = currentVector.sum();
        currentVector = currentVector.div(sum);

        iterationCount++;

        // Check convergence
        if (Matrix.sub(currentVector, previousVector).norm() < CONVERGENCE_THRESHOLD) {
            console.log("Converged after " + iterationCount + " iterations.");
            return currentVector;
        }
    }
};


