const {Matrix} = require("ml-matrix");
const { MongoClient, ObjectId } = require('mongodb');
const Page = require("./Page.js");
const mongoose = require('mongoose');
const { connect, Types } = mongoose;

let adjacent,x0;
let alpha = 0.1;

// Create an async function to load the data.
// Other mongoose calls that return promise (connect) 
// inside the async function can use an await.
const loadData = async () => {
	//Connect to the mongo database
  	const result = await connect('mongodb://localhost:27017/lab3');
    return result;

};

// Call to load the data.
loadData()
  .then(async ()=>{
    let resultingMatrix;
    let result = await Page.find({});
    let len = result.length;
    adjacent = Matrix.zeros(len,len);
    //Initial PageRank vector
    x0 = Matrix.eye(1,len);
    // a/N matrix
    m = Matrix.ones(len,len).mul(1/len);

    //adjacent matrix
    for (let document of result){
        let curPage = document.title;
        let outgoing = document.outgoing;
        for(let o of outgoing){
            let title = o.split('-').pop().split(".")[0];
            let current = curPage.split('-')[1];
            adjacent.set(current,title,1);
        }
    }
    //divide each 1 by the number of 1s in that row
    for(let i  = 0 ;i <len ; i++){
        let count = 0;
        for(let j = 0 ; j < len ; j++){
            let val = adjacent.get(i,j);
            if(val === 1){
                count++;
            }
        }

        //If a row in the adjacency matrix has no 1s, replace each element by 1/N
        if(count === 0){
            for(let j = 0 ; i < len ; j++){
                adjacent.set(i,j,1/len);
            }
            continue;
        }
        
        //divide each 1 by the number of 1s in that row
        for(let j = 0 ; j < len ; j++){
            let val = adjacent.get(i,j);
            if(val ===1){
                adjacent.set(i,j,1/count);
            }
        }
        
    }
    console.log(adjacent)
    resultingMatrix = adjacent.mul(1-alpha).add(m.mul(alpha));
    console.log(adjacent.mul(1-alpha));
    console.log(m.mul(alpha))
    console.log(resultingMatrix)
})
  .catch(err => console.log(err));

