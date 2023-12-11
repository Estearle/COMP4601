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

//read file
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
                if (ratings[user][itemA] === 0) continue; //Skip if the user has not rated
                for (let userB in ratings) {
                    if (userB !== user) {
                        if (ratings[userB][itemA] === 0) continue;
                        let similarity = calculateSimilarity(ratings, userAvgs, user, userB, itemA);
                        if (!allSimilarities[user][itemA]) allSimilarities[user][itemA] = {};
                        allSimilarities[user][itemA][userB] = similarity;
                    }
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
            console.log("User-based, has similarity threshold of " + THRESOLD_VAL +  ", top " + NEIGHBOURHOOD_SIZE + " neighbours");
        } else {
            console.log("User-based, no similarity threshold, top " + NEIGHBOURHOOD_SIZE + " neighbours");
        }
        console.log("Total predictions: " + totalPred);
        console.log("Total under predictions (< 1): " + underPred);
        console.log("Total over predictions (> 5): " + overPred);
        console.log("Number of cases with no valid neighbours: " + noNeighbour);
        console.log("Average neighbours used: " + sumNeighbour / totalPred);
        console.log("MAE = " + errorSum / totalPred);
        console.timeEnd("timerMAE");

    })

    .catch(error => {
        console.log(error);
    });


function calculateSimilarity(ratings, userAverages, userA, userB, skipItem) {
    let sumProduct = 0;
    let sumASquared = 0;
    let sumBSquared = 0;
    let count = 0;
    userAverageUpdate = calculateAdjustedAverage(ratings, userA, skipItem);
    for (let item in ratings[userA]) {
        if (item === skipItem) continue //Skip the user for whom we're calculating similarities
        if (ratings[userA][item] === 0 || ratings[userB][item] === 0) continue; // Skip if either user hasn't rated the item

        let ratingA = ratings[userA][item];
        let ratingB = ratings[userB][item];

        let a = ratingA - userAverageUpdate;
        let b = ratingB - userAverages[userB];

        sumProduct += a * b;
        sumASquared += a * a;
        sumBSquared += b * b;
        count++;
    }

    if (count === 0 || sumASquared === 0 || sumBSquared === 0) {
        return 0;
    }

    return sumProduct / (Math.sqrt(sumASquared) * Math.sqrt(sumBSquared));
}


// Function to calculate the predicted rating for a user and an item
function calculatePredictedRating(userName, itemToPredict, allSimilarities, ratings, userAvgs, neighbourhoodSize) {

    let sortedSimilarities = [];
    console.log("");

    // Build an array of similarities and corresponding items
    for (let otherUser in allSimilarities[userName][itemToPredict]) {
        let similarity = allSimilarities[userName][itemToPredict][otherUser];
        if (!threshold) {// If no threshold then take in all possible values
            sortedSimilarities.push({
                otherUser: otherUser,
                similarity: similarity
            });
        } else {
            if (THRESOLD_VAL === 0) {
                if (similarity > THRESOLD_VAL) { // Considering only positive similarities
                    sortedSimilarities.push({
                        otherUser: otherUser,
                        similarity: similarity
                    });
                }
            } else {
                if (Math.abs(similarity) >= THRESOLD_VAL) { //If a threshold exists,take the absolute similarity for comparison
                    sortedSimilarities.push({
                        otherUser: otherUser,
                        similarity: similarity // Include negative values
                    })
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

    let num = 0;
    let denom = 0;
    let adjustedSize = Math.min(sortedSimilarities.length, neighbourhoodSize);
    let topSimScores = sortedSimilarities.slice(0, adjustedSize);
   

    console.log(`Predicting for user: ${userName}`);
    console.log(`Predicting for item: ${itemToPredict}`);
    console.log(`Found ${adjustedSize} valid neighbours:`);

    topSimScores.forEach((sim, index) => {
        //console.log(`${index + 1}. User${sim.otherUser} sim=${sim.similarity}`);
        num += sim.similarity * (ratings[sim.otherUser][itemToPredict] - userAvgs[sim.otherUser]);
        denom += sim.similarity;
    });
    let userAverageUpdate = calculateAdjustedAverage(ratings, userName, itemToPredict);
    let predictedRating = userAverageUpdate;
    predictedRating += num / denom;

    if (denom === 0) {
        noNeighbour++;
        let adjustedAvg = calculateAdjustedAverage(ratings, userName, itemToPredict);
        console.log("Initial predicted value: " + adjustedAvg);
        console.log("Final Predicted Value: " + adjustedAvg);
        return Number(adjustedAvg.toFixed(2));
    }
    console.log("Initial predicted value: " + Number(predictedRating.toFixed(2)));
    if (predictedRating < 1) {
        underPred++;
        console.log("Final Predicted Value: " + 1);
        sumNeighbour+=adjustedSize;
        return (1);
    } else if (predictedRating > 5) {
        overPred++;
        console.log("Final Predicted Value: " + 5);
        sumNeighbour+=adjustedSize;
        return (5);
    }
    console.log("Final Predicted Value: " + Number(predictedRating.toFixed(2)));
    sumNeighbour += adjustedSize;


    return Number(predictedRating.toFixed(2));

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