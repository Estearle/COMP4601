const fs = require("fs");
const path = require('path');

let information = [];
let newVal = [];
let missingVal = [];
let NEIGHBOURHOOD_SIZE = 2;

//read all the txt files in test directory
let reader = fs.readdirSync('test');
reader.forEach(file => {
    let fileData = fs.readFileSync(path.join('test', file), 'utf-8');
    let avg = [];
    let unknownPos = [];
    let obj = fileData.split("\n");
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
    for(let j = 0 ; j < i.position.length;j++){
        let pos = i.position[j];
        let similaries = simCalculation(i.matrix,pos.row,pos.col);
        console.log(similaries);
    }
   
}
// // check the position of -1
// let matrix = information.map(each => each.matrix);
// for (let i = 0; i < matrix.length; i++) {
//     for (let j = 0; j < matrix[i].length; j++) {
//         if (matrix[i][j].includes(-1)) {
//             for (let k = 0; k < matrix[i][j].length; k++) {
//                 if (matrix[i][j][k] === -1) {
//                     console.log(simCalculation(matrix[i][j], matrix[i], j, k));
//                     let similarities = simCalculation(matrix[i][j], matrix[i], j, k);
//                     let predictedRating = calculatePredictedRating(j, k, matrix[i], avg, similarities, NEIGHBOURHOOD_SIZE);
//                     newVal.push(predictedRating);
//                     missingVal.push({i,j,k});
//                 }
//             }
//         }
//     }
// }


function simCalculation(wholeMatrix, row, col) {

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
                product += wholeMatrix[j][col] * wholeMatrix[j][i];
                sumA += wholeMatrix[j][col] * wholeMatrix[j][col];
                sumB += wholeMatrix[j][i] * wholeMatrix[j][i];
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