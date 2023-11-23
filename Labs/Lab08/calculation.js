const fs = require("fs").promises;

let information = [];
let newVal = [];
let allSimilarities = {};
let NEIGHBOURHOOD_SIZE = 5;

//read txt file
(async () =>{
    try {
        // let data = await fs.readFile('test.txt','utf8')
        let data = await fs.readFile('parsed-data-trimmed.txt', 'utf8');
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
            let average = 0 ;
            for (let j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j] !== 0) {
                    average += matrix[i][j];
                    knownPos.push({ "row": i, "col": j });
                }
            }
            avg.push(average/matrix[i].length);
        }
        information.push({ "size": size, "user": row, "col": col, "matrix": matrix, "position": knownPos, "average": avg});
        console.log(row.length,col.length)
    }
    catch (err) {
        console.log(err);
    }
})()

.then(()=>{
    
    for (let i of information) {
        allSimilarities[i.user] = {}; // Initialize an object for each user
        for (let pos of i.position) {
            // Calculate and store the similarities for the specific missing rating position (row, col)
            allSimilarities[i.user][pos.col] = simCalculation(i.matrix, pos.row, pos.col, i.average);
            // Retrieve the pre-calculated similarities for the specific missing value
            let itemSimilarities = allSimilarities[i.user][pos.col];
            let predicted = calculatePredictedRating(pos.row, pos.col, itemSimilarities, i.matrix, i.average, NEIGHBOURHOOD_SIZE);
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

        console.log(i.matrix);
    }
  
})

.then(()=>{
    // for (let info of information) {
    //     for (let prediction of newVal) {
    //         let userIndex = info.user.indexOf(prediction.user);
    //         let itemIndex = info.col.indexOf(prediction.item);
    //         if (userIndex !== -1 && itemIndex !== -1) {
    //             info.matrix[userIndex][itemIndex] = prediction.predictedRating;
    //         }
    //     }
    // }
    
    // for (let info of information) {
    //     console.log(info.matrix);
    // }
})

.catch(error =>{
    console.log(error);
});

function simCalculation(wholeMatrix, row, col, avg) {
    let result = {};
    let average = 0 ;
    let count = 0 ;
    //Adjusted Cosine Similarity
    for (let i = 0; i < wholeMatrix[0].length; i++) {
        if (col === i) {
            continue;
        }
        let product = 0;
        let sumA = 0;
        let sumB = 0;
        for (let j = 0; j < wholeMatrix.length; j++) {
            if(j === row || wholeMatrix[j][col] === 0 || wholeMatrix[j][i] === 0) continue;
            if(wholeMatrix[j][col] !== 0 && wholeMatrix[j][i] !== 0){
                average += avg[j];
                count++;
                let a = (wholeMatrix[j][col] - avg[j]);
                let b = (wholeMatrix[j][i] - avg[j]);
                product += a * b ;
                sumA += a * a;
                sumB += b * b;
            }
        }

        if (sumA !== 0 && sumB !== 0) {
            let calculation = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
            result[col + ',' + i] = calculation;
        } else {
            //average rating score of the user without the current rating 
            // console.log(average,count)
            if(count === 0 ){
                result[col + ',' + i ] = 0;
            }
            else{
                result[col + ',' + i ] = average/count;
            }
            
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
        // .filter(sim => matrix[userIndex][sim.index] !== -1) // Exclude values that corresponds with a -1 rating
        // .slice(0, neighbourhoodSize);

    let sumNum = 0;
    let sumDenom = 0;
    let adjustedSize = Math.min(sortedSimilarities.length,neighbourhoodSize);
    let sorted = sortedSimilarities.slice(0,adjustedSize);

    sorted.forEach(sim => {
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

