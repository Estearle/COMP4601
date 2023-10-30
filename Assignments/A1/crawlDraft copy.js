const Crawler = require("crawler");
const url = require("url");
const {connect, connection} = require('mongoose');
const Page = require("./Game.js");
//store visited page 
let visited = ['https://boardgamegeek.com/boardgame/224517/brass-birmingham'];
let page = [];

const c = new Crawler({
    maxConnections : 10, //use this for parallel, rateLimit for individual
    //rateLimit: 1000,

    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$;
            console.log(res.body);

            // This will find all links nested within any div, regardless of depth
            let links = $("#mainbody .global-body-content-container li.rec-grid-item a.rec");
            let urlLink = res.request.uri.href;
            //console.log(links)
            $(links).each(function(i, link){
                //console.log($(link).text() + ':  ' + $(link).attr('href'));
            });
            
        }
        done();
    }
});

c.on('drain',function () {
    console.log("Done.");

 })


c.queue('https://boardgamegeek.com/boardgame/161533/lisboa/recommendations');


