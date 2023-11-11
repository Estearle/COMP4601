const { Matrix } = require("ml-matrix");
const fs = require("fs");
const path = require('path');

let information = [];
let newVal = [];
let NEIGHBOURHOOD_SIZE = 2;

//read all the txt files
let reader = fs.readdirSync('txt');
reader.forEach(file => {
    let fileData = fs.readFileSync(path.join('txt', file), 'utf-8');
    avg = [];
    let obj = fileData.split("\n");
    let userN = obj[1];
    let itemM = obj[2];
    let matrix = obj.slice(3);
    matrix = matrix.filter(row => row.trim() !== '')
    matrix = matrix.map(row => row.split(' ').map(Number));


    information.push({ "user": userN.split(" "), "itemM": itemM.split(" "), "matrix": matrix ,"result":matrix});

});

// check the position of -1
let matrix = information.map(each => each.matrix);
for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j].includes(-1)) {
            for (let z = 0; z < matrix[i][j].length; z++) {
                if (matrix[i][j][z] === -1) {
                    console.log(simCalculation(matrix[i][j], matrix[i], j, z));
                    let similarities = simCalculation(matrix[i][j], matrix[i], j, z);
                    let predictedRating = calculatePredictedRating(j, z, matrix[i], avg, similarities, NEIGHBOURHOOD_SIZE);
                    newVal.push(predictedRating);
                }
            }
        }
    }
}


function simCalculation(a, wholeMatrix, row, col) {
    avg = [];
    // console.log(wholeMatrix);
    result = {};
    // average per row 
    for (let i = 0; i < wholeMatrix.length; i++) {
        let average = 0;
        let count  =0;
        for (let j = 0; j < wholeMatrix[i].length; j++) {
            if (wholeMatrix[i][j] !== -1 ) {
                average += wholeMatrix[i][j]; 
                count++;
            }
        }
        avg.push(average / count);
    }
    //Pearson's correlation coefficient 
    for (let i = 0; i < wholeMatrix.length; i++) {
        if (row === i) {
            continue;
        }

        let product = 0;
        let sumA = 0;
        let sumB = 0;
        for (let j = 0; j < wholeMatrix[row].length; j++) {
            if (row !==i && wholeMatrix[i][j] != -1 && wholeMatrix[row][j] != -1 ) {
                let a = wholeMatrix[row][j] - avg[row];
                let b = wholeMatrix[i][j] - avg[i];
                product += a * b;
                sumA += a * a;
                sumB += b * b;
            }

        }
        
        let calculation = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
        
        result[[row, i]] = calculation;

    }
    return result;
}

// Function to calculate the predicted rating for a user and an item
function calculatePredictedRating(userIndex, itemIndex, matrix, avg, similarities, neighborhoodSize) {

    // Collect all similarity scores along with their pairs
    let simScoresWithPairs = [];
    for (let pair in similarities) {
        simScoresWithPairs.push({ score: similarities[pair], pair: pair });
    }

    // Sort the scores to get the highest ones based on the neighborhood size
    simScoresWithPairs.sort((a, b) => b.score - a.score);
    let topSimScores = simScoresWithPairs.slice(0, neighborhoodSize);

    let num = 0;
    let denom = 0;

    topSimScores.forEach(sim => {
        let parts = sim.pair.split(',').map(part => parseInt(part, 10));
        let otherUserIndex = parts[1];
        if (matrix[otherUserIndex][itemIndex] !== -1) {
            num += sim.score * (matrix[otherUserIndex][itemIndex] - avg[otherUserIndex]);
            denom += sim.score; 
        }
    });

    let predictedRating = avg[userIndex];
    if (denom !== 0) {
        predictedRating += num / denom;
    }

    return Number(predictedRating.toFixed(2));

}
console.log(avg);
console.log(newVal);
let index = 0;
for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j].includes(-1)) {
            for (let z = 0; z < matrix[i][j].length; z++) {
                if (matrix[i][j][z] === -1) {
                    matrix[i][j][z] = newVal[index++];
                }
            }
        }
    }
}
console.log(matrix);