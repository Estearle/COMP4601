const Crawler = require("crawler");
const url = require("url");
const { connect, connection } = require('mongoose');
const Game = require("./Game.js");
const puppeteer = require("puppeteer");
const { Matrix } = require("ml-matrix");
const { MongoClient } = require("mongodb");

//store visited page 
let visited = ['https://boardgamegeek.com/boardgame/224517/brass-birmingham'];
let game = []; 

//Retreive all other info
async function info(href,obj) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: 'true'});
    const page = await browser.newPage();
    await page.goto(href);

    // num of player 
    let numOfPlayerSelector = "#mainbody > div.global-body-content-container.container-fluid > div > div.content.ng-isolate-scope > div:nth-child(2) > ng-include > div > ng-include > div > div.game-header > div.game-header-body > div.game-header-gameplay.hidden-game-header-collapsed.ng-scope > gameplay-module > div > div > ul > li:nth-child(1) > div.gameplay-item-primary";
    let numOfPlayer = await page.$eval(numOfPlayerSelector, (num) => {
        // Get rid of all the \t between the string and convert the min and max into number
        let result = num.textContent.replace(/\t/g, '').trim().split(" ")[0];
        result = result.split("–").map(num => Number(num));
        return result
    });

    // playingTime 
    let playingTimeSelector = "#mainbody > div.global-body-content-container.container-fluid > div > div.content.ng-isolate-scope > div:nth-child(2) > ng-include > div > ng-include > div > div.game-header > div.game-header-body > div.game-header-gameplay.hidden-game-header-collapsed.ng-scope > gameplay-module > div > div > ul > li:nth-child(2) > div.gameplay-item-primary > span";
    let playingTime = await page.$eval(playingTimeSelector, (result) => {
        let time = result.textContent.replace(/\t/g, '').trim().split(" ")[0];
        time = time.split("–").map(num => Number(num));
        return time;
    })

    // recommended age
    let recommendatedAgeSelector = "#mainbody > div.global-body-content-container.container-fluid > div > div.content.ng-isolate-scope > div:nth-child(2) > ng-include > div > ng-include > div > div.game-header > div.game-header-body > div.game-header-gameplay.hidden-game-header-collapsed.ng-scope > gameplay-module > div > div > ul > li:nth-child(3) > div.gameplay-item-primary";
    let recommendatedAge = await page.$eval(recommendatedAgeSelector, (result) => {
        let recommend = result.textContent.replace(/\t/g, '').trim().split(" ");
        return recommend[recommend.length - 1];
    })

    // complexity [rating,max]
    let complexitySelector = "#mainbody > div.global-body-content-container.container-fluid > div > div.content.ng-isolate-scope > div:nth-child(2) > ng-include > div > ng-include > div > div.game-header > div.game-header-body > div.game-header-gameplay.hidden-game-header-collapsed.ng-scope > gameplay-module > div > div > ul > li:nth-child(4) > div.gameplay-item-primary";
    let complexity = await page.$eval(complexitySelector, (result) => {
        let c = result.textContent.replace(/\t/g, '').trim().split(" ");
        // remove all whitespace and strings that are not numbers
        c = c.filter(data => !isNaN(Number(data)) && data !== "");
        c = c.map(num => Number(num));
        return c;
    })

    // categories
    let categoriesSelector = '#mainbody > div.global-body-content-container.container-fluid > div > div.content.ng-isolate-scope > div:nth-child(2) > ng-include > div > div > ui-view > ui-view > div > overview-module > description-module > div > div.panel-body > div > div.game-description-classification.well.ng-scope > classifications-module > div > div.panel-body > ul > li:nth-child(2)';
    let category = await page.$$eval(categoriesSelector, (result) => {
        let categories = [];
        for (let cat of result) {
            let text = cat.textContent.replace(/\t/g, '').trim().split(" ");
            text = text.filter(data => data !== "Category" && data !== "N/A" && data !== "+" && data !== "0" && data !== "more" && data !== "" && data !== "/");
            categories.push(text);
        }
        return categories;
    });
    // console.log(numOfPlayer);
    // console.log(playingTime)
    // console.log(recommendatedAge)
    // console.log(complexity)
    // console.log(category[0])
    obj.numOfPlayers = numOfPlayer;
    obj.playingTime = playingTime;
    obj.recommendedAge = recommendatedAge;
    obj.complexity = complexity;
    obj.categories = category[0];
    // Close the browser
    await browser.close();
    
}

//Retreive "Fans Also Like"
async function retreiveInfo(href,obj) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: 'true'});
    const page = await browser.newPage();

    await page.goto(`${href}/recommendations`);
    let links = await page.$$('li.rec-grid-item a.rec');
    let fanAlsoLike = [];
    for (let link of links) {
        let href = await link.getProperty('href');
        href = await href.jsonValue();
        fanAlsoLike.push(href);
    }
    // console.log(fanAlsoLike);
    obj.fanAlsoLike = fanAlsoLike;
    // Close the browser
    await browser.close();
};


const c = new Crawler({
    maxConnections: 5, 
    retryTimeout:5000,
    retries:3,

    callback: async function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;
            let title = $('meta[name="title"]').attr('content');
            console.log(title);
            let urlLink = res.request.uri.href;
            console.log(urlLink);
            let check = game.find(c => c.link === urlLink);
            let current ;
            if(!check){
                current = {"title":title,"link":urlLink,"numOfPlayers":[],"playingTime":[],"recommendedAge":"","complexity":'',"categories":[],"fanAlsoLike":[],"pageRank":0};
            }
            
            await info(urlLink,current);
            await retreiveInfo(urlLink,current);
            game.push(current);
            console.log(game.length);
            // console.log(game[urlLink])
            game.forEach(g=>{
                g.fanAlsoLike.forEach(link=>{
                    if(!visited.includes(link) && visited.length < 500 ){
                        visited.push(link);
                        c.queue(link);
                    }
                })
            });
            done();
        }
    }
});

c.on('drain', function () {
    console.log(game);
    console.log(game.length);
    console.log("Done.");
    //This gives you a 'client' object that you can use to interact with the database
    const loadData = async () => {
        //Connect to the mongo database.
        await connect('mongodb://localhost:27017/A1');

        //Remove database and start anew.
        let collectionNames = await connection.db.listCollections().toArray();
        let collectionExists = collectionNames.some(col => col.name === 'games'); 

        // If the collection exists, drop it.
        if (collectionExists) {
            await Game.collection.drop();
        }
        let obj = Object.values(game).map(p => new Game(p));

        await Game.create(obj);

    }

    //Call to load the data.
    //Once the loadData Promise returns it will close the database
    //connection.  Any errors from connect, dropDatabase or create
    //will be caught in the catch statement.
    loadData()
    .then((result) => {
        console.log("Closing database connection.");
        connection.close();
    })
        .catch(err => console.log(err));

})

c.queue('https://boardgamegeek.com/boardgame/224517/brass-birmingham');


