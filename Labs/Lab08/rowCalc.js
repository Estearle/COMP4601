const fs = require("fs").promises;

let information = [];
let newVal = [];
let allSimilarities = {};
let NEIGHBOURHOOD_SIZE = 5;
let totalPred = 0;
let underPred = 0;
let overPred = 0;
let noNeighbour = 0;
let sumNeighbour = 0;

//read txt file
(async () => {
    try {
        let data = await fs.readFile('parsed-data-trimmed.txt','utf8')
        // let data = await fs.readFile('parsed-data-trimmed.txt', 'utf8');
        let knownPos = [];
        let avg = [];
        let lines = data.trim().split('\n');

        let size = lines[0].split(" ").map(Number);
        let row = lines[1].trim().split(" ").map(Number);
        let col = lines[2].trim().split(" ").map(Number);
        let matrix = lines.slice(3);
        matrix = matrix.filter(row => row.trim() !== '')
        matrix = matrix.map(row => row.trim().split(' ').map(Number));

        //find the average
        //check the position of 0(no rating)
        for (let i = 0; i < matrix.length; i++) {
            let average = 0;
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] !== 0) {
                    average += matrix[i][j];
                    //push when it has rating 
                    knownPos.push({ "row": i, "col": j });
                }
            }
            avg.push(average / matrix[i].length);
        }
        information.push({ "size": size, "user": row, "col": col, "matrix": matrix, "position": knownPos, "average": avg });
        console.log(row.length, col.length);
    }
    catch (err) {
        console.log(err);
    }
})()

    .then(() => {

        for (let i of information) {
            allSimilarities[i.user] = {}; // Initialize an object for each user
            for (let pos of i.position) {
                // Calculate and store the similarities for the specific missing rating position (row, col)
                allSimilarities[i.user][pos.col] = simCalculation(i.matrix, pos.row, pos.col, i.average);
                // Retrieve the pre-calculated similarities for the specific missing value
                let itemSimilarities = allSimilarities[i.user][pos.col];
                // console.log(itemSimilarities);
                let predicted = calculatePredictedRating(pos.row, pos.col, itemSimilarities, i.matrix, i.average, NEIGHBOURHOOD_SIZE);
                if (predicted < 1) {
                    underPred++;
                } else if (predicted > 5) {
                    overPred++;
                }                
                totalPred++;
                // Update the newVal array with the predicted rating, not the original matrix
                newVal.push({
                    user: i.user[pos.row],
                    item: i.col[pos.col],
                    predictedRating: predicted
                });
            }

            for (let prediction of newVal) {
                let userIndex = i.user.indexOf(prediction.user);
                let itemIndex = i.col.indexOf(prediction.item);
                if (userIndex !== -1 && itemIndex !== -1) {
                    i.matrix[userIndex][itemIndex] = prediction.predictedRating;
                }
            }
            // console.log(i.matrix);
            console.log("Item-based, top 5 neighbours");
            console.log("Total predictions: " + totalPred);
            console.log("Total under predictions (< 1): " + underPred);
            console.log("Total over predictions (> 5): " + overPred);
            console.log("Number of cases with no valid neighbours: " + noNeighbour);
            console.log("Average neighbours used: " + sumNeighbour/totalPred);
        }

    })

    .catch(error => {
        console.log(error);
    });

function simCalculation(wholeMatrix, row, col, avg) {
    let result = {};
    let average = 0;
    //Adjusted Cosine Similarity
    for (let i = 0; i < wholeMatrix[0].length; i++) {
        if (col === i) continue;

        let product = 0;
        let sumA = 0;
        let sumB = 0;
        for (let j = 0; j < wholeMatrix.length; j++) {
            if (j === row || wholeMatrix[j][col] === 0 || wholeMatrix[j][i] === 0) continue;
            average += avg[j];
            let a = (wholeMatrix[j][col] - avg[j]);
            let b = (wholeMatrix[j][i] - avg[j]);
            product += a * b;
            sumA += a * a;
            sumB += b * b;

        }

        if (sumA !== 0 && sumB !== 0) {
            let calculation = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
            result[col + ',' + i] = calculation;
        } else {
            //average rating score of the user without the current rating 
            result[col + ',' + i] = average / wholeMatrix[0].length - 1;

        }
    }
    // console.log(result);
    return result;
}

function calculatePredictedRating(userIndex, itemIndex, similarities, matrix, avg, neighbourhoodSize) {
    // Convert the similarities object to an array and sort by similarity score
    // console.log(similarities);
    let sortedSimilarities = Object.keys(similarities)
        .map(key => ({ index: parseInt(key.split(',')[1]), similarity: similarities[key] }))
        .filter(sim => sim.index !== itemIndex) // Exclude similarity with the item itself
        .filter(sim => sim.similarity >= 0) // Exclude similarity scores of less than 0
        .filter(sim => matrix[userIndex][sim.index] !== 0) // Exclude similarity with the rating being 0
        .sort((a, b) => b.similarity - a.similarity)

    // use as many neighbours as possible
    // min neighbours : [1,5]
    let sumNum = 0;
    let sumDenom = 0;
    let adjustedSize = Math.min(sortedSimilarities.length, neighbourhoodSize);
    let sorted = sortedSimilarities.slice(0, adjustedSize);

    if (adjustedSize === 0) {
        noNeighbour++;
    } else {
        sumNeighbour+=adjustedSize;
    }

    console.log("Predicting for user: User" + userIndex);

    console.log("Predicting for item: Item" + itemIndex);
    console.log("Found " + adjustedSize + " valid neighbours: ");
    // console.log(sorted);
    let index = 1;

    sorted.forEach(sim => {
        console.log(index + ". Item Item" + sim.index + " sim=" + sim.similarity);
        index++;
        sumNum += sim.similarity * matrix[userIndex][sim.index];
        sumDenom += sim.similarity;
    });
    
    console.log("Initial predicted value: " + sumNum / sumDenom);
    // If there are no similar items with a positive similarity, return the user's average rating
    if (sumDenom === 0) {
        console.log("Final Predicted Value: " + avg[userIndex]);
        console.log(" ");
        return avg[userIndex];
    }
    console.log("Final Predicted Value: " + sumNum / sumDenom);
    console.log(" ");
    return (sumNum / sumDenom);
}

