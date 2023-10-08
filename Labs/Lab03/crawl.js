const Crawler = require("crawler");
const url = require("url");
const {connect, connection} = require('mongoose');
const Page = require("./Page.js");
//store visited page 
let visited = ['https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html'];
let page = [];

const c = new Crawler({
    maxConnections: 7,
    rateLimit: 100,
    retryTimeout:5000,
    retries:3,


    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            let $ = res.$;
            let links = $("a");
            let urlLink = res.request.uri.href;
            let outgoing = [];

            // create if it doesn't exist
                if(!page[urlLink]){
                    page[urlLink]={link: urlLink,"outgoing":[],"incoming":[],content:[$("p").text()]};
                }
                else{
                    // add content
                    if(page[urlLink].content.length ===0){
                        page[urlLink].content.push($("p").text());
                    }
                }
            
            $(links).each(function (i, link) {
                // Resolve URLs
                href = url.resolve(res.request.uri.href,$(link).attr('href'));
                //push all the outgoing links into the array
                outgoing.push(href)
               
                //create if it doesn't exist
                if(!page[href]){
                    page[href]={link: href,"outgoing":[],"incoming":[],content:[]};
                }

                page[href].incoming.push(urlLink);
               // console.log($(link).text() + ':  ' + $(link).attr('href')+"\n");

                // Add new links to the queue if they haven't been visited yet
                if (!visited.includes(href)) {
                    visited.push(href);  
                    c.queue(href);  
                   
                }
            });
            page[urlLink].outgoing = outgoing
            
        }
        done();
    }
});

c.on('drain',function () {
    console.log("Done.");
    //This gives you a 'client' object that you can use to interact with the database
    const loadData = async() =>{
    //Connect to the mongo database.
    await connect('mongodb://localhost:27017/lab3');
   
    //Remove database and start anew.
    await connection.dropDatabase();
    let obj = Object.values(page).map(p=>new Page(p));

    await Page.create(obj);
    
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
});

c.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');


