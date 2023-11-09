const { Matrix } = require("ml-matrix");
const fs = require("fs");
const path = require('path');

let information = [];

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
            if (row !==i && wholeMatrix[i][j] != -1) {
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

