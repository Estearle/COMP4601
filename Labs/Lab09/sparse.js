const fs = require("fs").promises;


let PATH_LENGTH = 3;
let ratings = {};

//read txt file
(async () => {
    try {
        console.time("timerMAE");
        // Read the file data
        let data = await fs.readFile('test2.txt', 'utf8');
        let lines = data.trim().split('\n');
        let numUsers = parseInt(lines[0].split(' ')[0], 10);
        let users = lines[1].trim().split(' ');
        let items = lines[2].trim().split(' ');
        let matrix = lines.slice(3).map(row => row.trim().split(' ').map(Number));

        // Parse the ratings and calculate averages
        for (let i = 0; i < numUsers; i++) {
            let userName = users[i];
            ratings[userName] = {};

            for (let j = 0; j < items.length; j++) {
                const itemRating = matrix[i][j];
                ratings[userName][items[j]] = itemRating;
            }
        }

        // console.log(ratings);
    }
    catch (err) {
        console.log(err);
    }
})()

    .then(() => {
        let userSet = new Set();
        let itemSet = new Set();
        let recItem = {};
        for (let item in ratings['User1']) {
            // console.log(ratings['User1'][item])
            if (ratings['User1'][item] === 1) {
                itemSet.add(item)
                for (let user in ratings) {
                    if (ratings[user][item] === 1 && user !== 'User1') {
                        userSet.add(user)
                    }
                }
            }
        }
        console.log(userSet)
        userSet.forEach(function (user) {
            for (let item in ratings[user]) {
                console.log(user)
                if (ratings[user][item] === 1 && !itemSet.has(item)) {
                    console.log(item)
                    if (!recItem[item]) {
                        recItem[item] = 1;
                    }
                    else {
                        recItem[item]++;
                    }
                }
            }
        })
      
        console.log(recItem)
    })

    .catch(error => {
        console.log(error);
    });

