const { Matrix } = require("ml-matrix");
const { MongoClient, ObjectId } = require('mongodb');
const Game = require("./Game.js");
const Game = require("./Game.js");
const mongoose = require('mongoose');
const { connect, Types } = mongoose;

let adjacent, x0;
let alpha = 0.1;
let CONVERGENCE_THRESHOLD = 0.0001;

let computeGameRank = (transitionMatrix, initialVector) => {
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

// Create an async function to load the data.
// Other mongoose calls that return promise (connect) 
// inside the async function can use an await.
const loadData = async () => {
    //Connect to the mongo database
    const result = await connect('mongodb://localhost:27017/A1');
    return result;

};

// Call to load the data.
loadData()
    .then(async () => {
        let resultingMatrix;
        let result = await Game.find({});
        let len = result.length;
        adjacent = Matrix.zeros(len, len);
        //Initial GameRank vector
        x0 = Matrix.eye(1, len).fill(1 / len);
        // 1/N matrix
        m = Matrix.ones(len, len).mul(1 / len);

        // Define a mapping from titles to indices
        let titleToIndex = {};
        result.forEach((document, index) => {
            titleToIndex[document.title] = index;
        });

        // Adjusted adjacency matrix filling
        for (let document of result) {
            let curGame = document.title;
            let fanAlsoLike = document.fanAlsoLike;
            for (let outgoing of fanAlsoLike) {
                let title = outgoing;
                adjacent.set(titleToIndex[curGame], titleToIndex[title], 1);
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
        let GameRankVector = computeGameRank(resultingMatrix, x0);
        console.log('GameRank Values:', GameRankVector);

        // Create an array of { title, rank } objects for display purposes
        let rankedGames = [];
        let GameRankArray = GameRankVector.to1DArray();
        for (let i = 0; i < result.length; i++) {
            const searchResult = await Game.updateOne({ "title": result[i].title }, { $set: { "pagaeRank": GameRankArray[i] } });
            console.log(result[i].title, ":", GameRankArray[i])
            rankedGames.push({
                title: result[i].title,
                rank: GameRankArray[i]
            });
        }

        rankedGames.sort((a, b) => b.rank - a.rank);

        let top25 = rankedGames.slice(0, 25);
        console.log("Top 25 Games by GameRank:");
        console.table(top25);
    })
    .then((result) => {
        console.log("Closing database connection.");
        connection.close();
    })
    .catch(err => console.log(err));
