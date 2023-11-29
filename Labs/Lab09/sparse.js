const fs = require("fs").promises;

//read txt file
(async () => {
    try {
        console.time("timerMAE");
        // Read the file data
        let data = await fs.readFile('parsed-data-trimmed.txt', 'utf8');
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
                if (predicted < 1) {
                    underPred++;
                } else if (predicted > 5) {
                    overPred++;
                }
                errorSum += Math.abs(predicted - ratings[user][itemA]);            
                totalPred++;
                // Update the predictions object with the predicted rating, not the original matrix
                // predictions[user] = {};
                // predictions[user][itemA] = predicted;

            }
        }

        // for (let prediction of predictions) {
        //     let userIndex = prediction.user;
        //     let itemIndex = prediction.item;
        //     if (userIndex && itemIndex) {
        //         ratings[userIndex][itemIndex] = prediction.predictedRating;
        //     }
        // }
        console.log("");
        console.log("Item-based, top 5 neighbours");
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

