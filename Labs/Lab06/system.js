const { Matrix } = require("ml-matrix");
const fs = require("fs");
const path = require('path');

let information = [];
let newVal = [];

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
                    let predictedRating = calculatePredictedRating(j, z, matrix[i], avg, similarities);
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
                // console.log(wholeMatrix[i],wholeMatrix[i][j]);
                let a = wholeMatrix[row][j] - avg[row];
                let b = wholeMatrix[i][j] - avg[i];
                product += a * b;
                sumA += a * a;
                sumB += b * b;
                // console.log("A,B:",a,b)
            }

        }
        // console.log("THREE:",product,sumA,sumB)
        // console.log("\n")
        
        let calculation = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
        
        result[[row, i]] = calculation;

    }
    return result;
}

// Function to calculate the predicted rating for a user and an item
function calculatePredictedRating(userIndex, itemIndex, matrix, avg, similarities) {
    let allNegative = true;
    let leastNegativeSimScores = [-Infinity, -Infinity]; // Initialize with the lowest possible numbers
    let lowestPairs = ["", ""]; // To keep track of the keys of the least negative similarity scores
    
    for (let pair in similarities) {
        if (similarities[pair] > 0) {
            allNegative = false;
            break; // Exit the loop if there is any positive similarity score
        } else if (similarities[pair] > leastNegativeSimScores[1]) {
            // Found a new least negative similarity score
            if (similarities[pair] > leastNegativeSimScores[0]) {
                // The new score is higher than both, shift the scores
                leastNegativeSimScores[1] = leastNegativeSimScores[0];
                lowestPairs[1] = lowestPairs[0];
                leastNegativeSimScores[0] = similarities[pair];
                lowestPairs[0] = pair;
            } else {
                // The new score is only higher than the second least negative
                leastNegativeSimScores[1] = similarities[pair];
                lowestPairs[1] = pair;
            }
        }
    }

    let num = 0;
    let denom = 0;
    if (allNegative && leastNegativeSimScores[0] !== -Infinity) {
        // Use the least negative similarity score for prediction
        let parts1 = lowestPairs[0].split(',').map(part => parseInt(part, 10));
        let user1 = parts1[1];
        num += leastNegativeSimScores[0] * (matrix[user1][itemIndex] - avg[user1]);
        denom += leastNegativeSimScores[0];
    
        if (leastNegativeSimScores[1] !== -Infinity) {
            // Use the second least negative similarity score for prediction if available
            let parts2 = lowestPairs[1].split(',').map(part => parseInt(part, 10));
            let user2 = parts2[1];
            num += leastNegativeSimScores[1] * (matrix[user2][itemIndex] - avg[user2]);
            denom += leastNegativeSimScores[1];
        }
    } else { 
        // Iterate over all other users
        for (let otherUserIndex = 0; otherUserIndex < matrix.length; otherUserIndex++) {
            if (otherUserIndex !== userIndex && matrix[otherUserIndex][itemIndex] !== -1) {
                let simScore = similarities[userIndex + ',' + otherUserIndex];
                // console.log("userIndex: " + userIndex + " | otherUserIndex: " + otherUserIndex + " | simScore: " + simScore + " | userRating: " + matrix[otherUserIndex][itemIndex] + " | avgRating: " + avg[otherUserIndex]);
                if (simScore !== undefined && simScore > 0) {
                    num += simScore * (matrix[otherUserIndex][itemIndex] - avg[otherUserIndex]);
                    denom += simScore;
                }
            }
        }
    }

    // Compute the predicted rating, but avoid division by zero
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