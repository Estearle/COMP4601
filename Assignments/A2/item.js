const fs = require("fs").promises;

let allSimilarities = {};
let NEIGHBOURHOOD_SIZE = 100;
let THRESOLD_VAL = 0;
let threshold = false;
let negatives = false;
let ratings = {};
let userAvgs = {};
let totalPred = 0;
let underPred = 0;
let overPred = 0;
let noNeighbour = 0;
let sumNeighbour = 0;
let errorSum = 0;

//read txt file
(async () => {
    try {
        console.time("timerMAE");
        // Read the file data
        let data = await fs.readFile('assignment2-data.txt', 'utf8');
        let lines = data.trim().split('\n');
        let numUsers = parseInt(lines[0].split(' ')[0], 10);
        let users = lines[1].trim().split(' ');
        let items = lines[2].trim().split(' ');
        let matrix = lines.slice(3).map(row => row.trim().split(' ').map(Number));

        // Parse the ratings and calculate averages
        for (let i = 0; i < numUsers; i++) {
            let userName = users[i];
            ratings[userName] = {};
            let sum = 0;
            let count = 0;

            for (let j = 0; j < items.length; j++) {
                const itemRating = matrix[i][j];
                ratings[userName][items[j]] = itemRating;
                if (itemRating !== 0) { // Assuming 0 is 'no rating'
                    sum += itemRating;
                    count++;
                }
            }

            // Calculate the average rating for the user
            if (count == 0) {
                userAvgs[userName] = 0;
            } else {
                userAvgs[userName] = sum / count;
            }

        }

        // console.log(ratings);
        // console.log(userAvgs);
    }
    catch (err) {
        console.log(err);
    }
})()

    .then(() => {

        // Calculate similarity scores for each user
        for (let user in ratings) {
            allSimilarities[user] = {};
            for (let itemA in ratings[user]) {
                if (ratings[user][itemA] === 0) continue; // Skip if the user has not rated the item
    
                for (let itemB in ratings[user]) {
                    if (itemA === itemB || ratings[user][itemB] === 0) continue; // Skip same item or not rated
    
                    // Calculate the similarity between itemA and itemB for the current user
                    let similarity = calculateSimilarity(ratings, userAvgs, itemA, itemB, user);
                    if (!allSimilarities[user][itemA]) allSimilarities[user][itemA] = {};
                    allSimilarities[user][itemA][itemB] = similarity;

                }

                let predicted = calculatePredictedRating(user, itemA, allSimilarities, ratings, userAvgs, NEIGHBOURHOOD_SIZE);
                errorSum += Math.abs(predicted - ratings[user][itemA]);            
                totalPred++;
                // Update the predictions object with the predicted rating, not the original matrix
                // predictions[user] = {};
                // predictions[user][itemA] = predicted;

            }
        }

        console.log("");

        if (threshold) {
            console.log("Item-based, has similarity threshold of " + THRESOLD_VAL +  ", top " + NEIGHBOURHOOD_SIZE + " neighbours");
        } else {
            console.log("Item-based, no similarity threshold, top " + NEIGHBOURHOOD_SIZE + " neighbours");
        }
        
        console.log("Total predictions: " + totalPred);
        console.log("Total under predictions (< 1): " + underPred);
        console.log("Total over predictions (> 5): " + overPred);
        console.log("Number of cases with no valid neighbours: " + noNeighbour);
        console.log("Average neighbours used: " + sumNeighbour/totalPred);
        console.log("MAE = " + errorSum/totalPred);
        console.timeEnd("timerMAE");

    })

    .catch(error => {
        console.log(error);
    });

function calculateSimilarity(ratings, userAvgs, itemA, itemB, excludeUser) {
    let product = 0;
    let sumA = 0;
    let sumB = 0;

    for (let user in ratings) {
        if (user === excludeUser) continue; // Skip the user for whom we're calculating similarities
        if (ratings[user][itemA] === 0 || ratings[user][itemB] === 0) continue;

        let a = ratings[user][itemA] - userAvgs[user];
        let b = ratings[user][itemB] - userAvgs[user];
        product += a * b;
        sumA += a * a;
        sumB += b * b;

    }

    if (sumA === 0 || sumB === 0) return 0;
    return product / (Math.sqrt(sumA) * Math.sqrt(sumB));
}

function calculatePredictedRating(userName, itemToPredict, allSimilarities, ratings, userAvgs, neighbourhoodSize) {

    let sortedSimilarities = [];
    console.log("");

    // Build an array of similarities and corresponding items
    for (let item in allSimilarities[userName][itemToPredict]) {
        let similarity = allSimilarities[userName][itemToPredict][item];
        if (!threshold) { // If no threshold then take in all possible values
            sortedSimilarities.push({
                item: item,
                similarity: similarity
            });
        } else {
            if (THRESOLD_VAL === 0) {
                if (similarity > THRESOLD_VAL) { // Considering only positive similarities
                    sortedSimilarities.push({
                        item: item,
                        similarity: similarity
                    });
                }
            } else {
                if (Math.abs(similarity) >= THRESOLD_VAL) { // If a threshold exists, take the absolute similarity for comparison
                    sortedSimilarities.push({
                        item: item,
                        similarity: similarity // Include negative values
                    });
                }
            }
        }

    }

    // Sort by similarity score
    if (negatives) {
        sortedSimilarities.sort((a, b) => Math.abs(b.similarity) - Math.abs(a.similarity));
    } else {
        sortedSimilarities.sort((a, b) => b.similarity - a.similarity);
    }

    // Use as many neighbours as possible, limiting to neighbourhood size
    let sumNum = 0;
    let sumDenom = 0;
    let adjustedSize = Math.min(sortedSimilarities.length, neighbourhoodSize);
    let sorted = sortedSimilarities.slice(0, adjustedSize);

    console.log(`Predicting for user: ${userName}`);
    console.log(`Predicting for item: ${itemToPredict}`);
    console.log(`Found ${adjustedSize} valid neighbours:`);

    // Go through the sorted array and calculate the weighted sum
    sorted.forEach((sim, index) => {
        // console.log(`${index + 1}. Item ${sim.item} sim=${sim.similarity}`);
        sumNum += sim.similarity * (ratings[userName][sim.item]);
        sumDenom += sim.similarity;
    });

    if (sumDenom === 0 || adjustedSize === 0) {
        noNeighbour++;
        let adjustedAvg = calculateAdjustedAverage(ratings, userName, itemToPredict);
        console.log("Initial predicted value: " + adjustedAvg);
        console.log("Final Predicted Value: " + adjustedAvg);
        return adjustedAvg;
        // console.log("Initial predicted value: " + userAvgs[userName]);
        // console.log("Final Predicted Value: " + userAvgs[userName]);
        // return userAvgs[userName];
    }

    console.log("Initial predicted value: " + sumNum / sumDenom);
    sumNeighbour+=adjustedSize;

    if (sumNum / sumDenom < 1) {
        underPred++;
        console.log("Final Predicted Value: " + 1);
        return (1);
    } else if (sumNum / sumDenom > 5) {
        overPred++;
        console.log("Final Predicted Value: " + 5);
        return (5);
    }
    console.log("Final Predicted Value: " + sumNum / sumDenom);

    return (sumNum / sumDenom);
}

function calculateAdjustedAverage(ratings, userName, excludeItem) {
    let sum = 0;
    let count = 0;
    for (let item in ratings[userName]) {
        if (item !== excludeItem && ratings[userName][item] !== 0) {
            sum += ratings[userName][item];
            count++;
        }
    }
    // Calculate the average rating for the user
    if (count === 0) {
        return 0;
    } else {
        return sum / count;
    }
}