const fs = require("fs").promises;


let PATH_LENGTH = 3;
let ratings = {};

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

        

    })

    .catch(error => {
        console.log(error);
    });

