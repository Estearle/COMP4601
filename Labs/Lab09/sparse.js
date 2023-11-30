const fs = require("fs").promises;


let PATH_LENGTH = 3;
let ratings = {};

//read txt file
(async () => {
    try {
        // Read the file data
        let data = await fs.readFile('test5.txt', 'utf8');
        let lines = data.trim().split('\n');
        let numUsers = parseInt(lines[0].split(' ')[0], 10);
        let users = lines[1].trim().split(' ');
        let items = lines[2].trim().split(' ');
        let matrix = lines.slice(3).map(row => row.trim().split(' ').map(Number));

        // Parse the ratings 
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
        let itemSet = new Set();
        let recItem = {};
        for (let item in ratings['User1']) {
            if (ratings['User1'][item] === 1) {
                itemSet.add(item)
            }
        }

        itemSet.forEach(function (item) {
            for (let user in ratings) {
                if (ratings[user][item] === 1 & user != 'User1') {
                    for (let i in ratings[user]) {
                        if (ratings[user][i] === 1 & !itemSet.has(i)) {
                            if (!recItem[i]) {
                                recItem[i] = 1;
                            }
                            else {
                                recItem[i]++;
                            }
                        }
                    }
                }
            }
        })
      
        // sort it in descending order
        recItem = Object.entries(recItem).sort((a,b)=>b[1]-a[1])
        console.log(recItem)
    })

    .catch(error => {
        console.log(error);
    });

