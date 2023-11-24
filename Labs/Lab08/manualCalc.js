// let aVal = [5, 3, 4, 3, 1];
// let bVal = [3, 1, 3, 3, 5];
// let cVal = [4, 2, 4, 1, 5];
// let dVal = [4, 3, 3, 5, 2];
// let eVal = [0, 3, 5, 4, 1];

// let matrix = [aVal, bVal, cVal, dVal, eVal];
// let avg = [];

// matrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
// console.log(matrix);

// for (let i = 0; i < matrix.length; i++) {
//     let average = 0;
//     for (let j = 0; j < matrix[i].length; j++) {
//         if (matrix[i][j] !== 0) {
//             average += matrix[i][j];
//             //push when it has rating 
//             // knownPos.push({ "row": i, "col": j });
//         }
//     }
//     avg.push(average / matrix[i].length);
// }
// console.log(avg);

// let product = 0;
// let sumA = 0;
// let sumB = 0;
// for (let i = 0; i < matrix.length; i++) {
//     if (i===1) continue;
//     let average = 0;
//     console.log(" ")
//     for (let j = 0; j < matrix[i].length; j++) {
//         if (j===1 || matrix[j][0] === 0 || matrix[j][i] === 0) continue;
//         average += avg[j];
//         console.log(matrix[j][0] + " " + matrix[j][i]);
//         let a = (matrix[j][0] - avg[j]);
//         let b = (matrix[j][i] - avg[j]);
//         product += a * b;
//         sumA += a * a;
//         sumB += b * b;
//     }  
// }

// let result = product / (Math.sqrt(sumA) * Math.sqrt(sumB));
// console.log(result);


function calculateSimilarity(ratings, userAvgs, itemA, itemB, person) {
    let sumOfProducts = 0;
    let sumOfSquaresA = 0;
    let sumOfSquaresB = 0;
    let count = 0;

    // Iterate over each user in the ratings object
    for (let user in ratings) {
        if (user !== person && ratings[user][itemA] !== 0 && ratings[user][itemB] !== 0) {
            let deviationA = ratings[user][itemA] - userAvgs[user];
            let deviationB = ratings[user][itemB] - userAvgs[user];
            sumOfProducts += deviationA * deviationB;
            sumOfSquaresA += deviationA ** 2;
            sumOfSquaresB += deviationB ** 2;
            count++;
        }
    }

    // If no common ratings between items, return 0 (or handle as needed)
    if (count === 0) return 0;

    let denominator = Math.sqrt(sumOfSquaresA) * Math.sqrt(sumOfSquaresB);

    // If denominator is 0, return 0 to prevent division by zero (or handle as needed)
    if (denominator === 0) return 0;

    // Return the Pearson correlation coefficient as similarity score
    return sumOfProducts / denominator;
}

const ratings = {
    'Alice': {'Item1': 5, 'Item2': 3, 'Item3': 4, 'Item4': 4, 'Item5': 0},
    'User1': {'Item1': 3, 'Item2': 1, 'Item3': 2, 'Item4': 3, 'Item5': 3},
    'User2': {'Item1': 4, 'Item2': 3, 'Item3': 4, 'Item4': 3, 'Item5': 5},
    'User3': {'Item1': 3, 'Item2': 3, 'Item3': 1, 'Item4': 5, 'Item5': 4},
    'User4': {'Item1': 1, 'Item2': 5, 'Item3': 5, 'Item4': 2, 'Item5': 1}
};


const userAvgs = {
    Alice: 3.2,
    User1: 2.4,
    User2: 3.8,
    User3: 3.2,
    User4: 2.8
};

// const p = 'User1'
// const itemA = 'Item1';
// const itemB = 'Item5';

function calculateSimilaritiesForAllUsers(ratings, userAvgs) {
    let allUserSimilarities = {};

    // Iterate over each user
    for (let person in ratings) {
        allUserSimilarities[person] = {};

        // Iterate over each item the person has rated
        for (let itemA in ratings[person]) {
            if (ratings[person][itemA] === 0) continue; // Skip if the person has not rated the item

            allUserSimilarities[person][itemA] = {};

            // Iterate over all other items for comparison
            for (let itemB in ratings[person]) {
                // Don't compare the item with itself and skip if no rating for the itemB
                if (itemA === itemB || ratings[person][itemB] === 0) continue;

                let similarityScore = calculateSimilarity(ratings, userAvgs, itemA, itemB, person);
                if (similarityScore > 0) {
                    allUserSimilarities[person][itemA][itemB] = similarityScore;
                }
            }
        }
    }  

    return allUserSimilarities;
}

// Calculate similarity scores for all users
const similaritiesForAllUsers = calculateSimilaritiesForAllUsers(ratings, userAvgs);

console.log('Similarity Scores for all users:', similaritiesForAllUsers);

// let similarityScore = calculateSimilarity(ratings, userAvgs, itemA, itemB, p);
// console.log('Similarity Score:', similarityScore);

// Manual
// let num = (5-userAvgs["Alice"])*(4-userAvgs["Alice"]) + (4-userAvgs["User2"])*(3-userAvgs["User2"]) + (3-userAvgs["User3"])*(5-userAvgs["User3"]) + (1-userAvgs["User4"])*(2-userAvgs["User4"])
// let den = Math.sqrt((5-userAvgs["Alice"])**2 + (4-userAvgs["User2"])**2 + (3-userAvgs["User3"])**2 + (1-userAvgs["User4"]) ** 2) * Math.sqrt((4-userAvgs["Alice"])**2 + (3-userAvgs["User2"])**2 + (5-userAvgs["User3"])**2 + (2-userAvgs["User4"])**2) 

// console.log(num/den);