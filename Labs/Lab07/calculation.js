const fs = require("fs");
const path = require('path');

let information = [];
let newVal = [];
let allSimilarities = {};
let NEIGHBOURHOOD_SIZE = 2;

//read all the txt files in test directory
let reader = fs.readdirSync('test');
reader.forEach(file => {
    let fileData = fs.readFileSync(path.join('test', file), 'utf-8');
    let avg = [];
    let unknownPos = [];
    let obj = fileData.replace(/\r/g,'').split("\n");
    let userN = obj[1];
    let itemM = obj[2];
    let matrix = obj.slice(3);

    matrix = matrix.filter(row => row.trim() !== '')
    matrix = matrix.map(row => row.split(' ').map(Number));
    
    // check the position of -1 
    // find the average
    for(let i = 0 ; i < matrix.length;i++){
        let average = 0 ; 
        let count = 0 ;
        for(let j = 0; j < matrix[i].length;j++){
            if(matrix[i][j] === -1){
                unknownPos.push({"row":i,"col":j});
            }
            else{
                average +=matrix[i][j];
                count++;
            }
        }
        avg.push(average/count);
    }


    information.push({ "user": userN.split(" "), "itemM": itemM.split(" "), "matrix": matrix ,"position":unknownPos,"average":avg});
});


for(let i of information){
    allSimilarities[i.user] = {}; // Initialize an object for each user
    for(let pos of i.position){
        // Calculate and store the similarities for the specific missing rating position (row, col)
        allSimilarities[i.user][pos.col] = simCalculation(i.matrix, pos.row, pos.col, i.average);
    }
}

for(let info of information){
    for(let pos of info.position){
        // Retrieve the pre-calculated similarities for the specific missing value
        let itemSimilarities = allSimilarities[info.user][pos.col];
        let predicted = calculatePredictedRating(pos.row, pos.col, itemSimilarities, info.matrix, info.average, NEIGHBOURHOOD_SIZE);
        
        // Update the newVal array with the predicted rating, not the original matrix
        newVal.push({
            user: info.user[pos.row],
            item: info.itemM[pos.col],
            predictedRating: predicted
        });
    }
}

function simCalculation(wholeMatrix, row, col, avg) {

    // console.log(wholeMatrix);
    let result = {};
    
    //Adjusted Cosine Similarity
    for (let i = 0; i < wholeMatrix[0].length; i++) {
        if (col === i) {
            continue;
        }

        let product = 0;
        let sumA = 0;
        let sumB = 0;

        for (let j = 0; j < wholeMatrix.length; j++) {
            if (wholeMatrix[j][col] !== -1 && wholeMatrix[j][i] !== -1) {
                product += (wholeMatrix[j][col] - avg[j]) * (wholeMatrix[j][i] - avg[j]) ;
                sumA += (wholeMatrix[j][col] - avg[j]) * (wholeMatrix[j][col] - avg[j]);
                sumB += (wholeMatrix[j][i] - avg[j]) * (wholeMatrix[j][i] - avg[j]); 
            }
        }

        if (sumA !== 0 && sumB !== 0) {
            let calculation = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
            result[[col, i]] = calculation;
        } else {
            result[[col, i]] = 0; 
        }
    }
    return result;
}

function calculatePredictedRating(userIndex, itemIndex, similarities, matrix, avg, neighbourhoodSize) {
    // Convert the similarities object to an array and sort by similarity score
    let sortedSimilarities = Object.keys(similarities)
        .map(key => ({ index: parseInt(key.split(',')[1]), similarity: similarities[key] }))
        .filter(sim => sim.index !== itemIndex) // Exclude similarity with the item itself
        .sort((a, b) => b.similarity - a.similarity)
        .filter(sim => matrix[userIndex][sim.index] !== -1) // Exclude values that corresponds with a -1 rating
        .slice(0, neighbourhoodSize);

    let sumNum = 0;
    let sumDenom = 0;
    sortedSimilarities.forEach(sim => {
        if (matrix[userIndex][sim.index] !== -1 && sim.similarity > 0) {
            sumNum += sim.similarity * matrix[userIndex][sim.index];
            sumDenom += sim.similarity;
        }
    });

    // If there are no similar items with a positive similarity, return the user's average rating
    if (sumDenom === 0) {
        return avg[userIndex];
    }

    return (sumNum / sumDenom);
}

for (let info of information) {
    for (let prediction of newVal) {
        let userIndex = info.user.indexOf(prediction.user);
        let itemIndex = info.itemM.indexOf(prediction.item);
        if (userIndex !== -1 && itemIndex !== -1) {
            info.matrix[userIndex][itemIndex] = prediction.predictedRating;
        }
    }
}


for (let info of information) {
    console.log(info.matrix);
}