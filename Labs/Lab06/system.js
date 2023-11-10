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
                    
                    // console.log(simCalculation(matrix[i][j], matrix[i], j, z));
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
    let leastNegativeSimScore = -1; // Keep track of the least negative similarity score
    let lowestPair;
    for (let pair in similarities) {
        if (similarities[pair] > 0) {
            allNegative = false;
        } else if (leastNegativeSimScore < similarities[pair]) {
            leastNegativeSimScore = similarities[pair];
            lowestPair = pair;
        }
    }

    let num = 0;
    let denom = 0;
    if (allNegative) {
        let parts = lowestPair.split(',').map(part => parseFloat(part, 10));
        let user = parts[1];
        console.log(leastNegativeSimScore);
        console.log(parts);
        denom = leastNegativeSimScore;
        num = leastNegativeSimScore*(matrix[user][itemIndex] - avg[user]);
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