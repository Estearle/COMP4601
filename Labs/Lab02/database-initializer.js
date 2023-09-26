import * as fs from 'fs';
import pkg from 'mongoose';
const{connect,connection} = pkg;
import Product from "./Product.js";

// product array 
let productsArr = [];
let productID = 0;
//read the JSON file and store all the products
fs.readFile('products.json', 'utf8', function (err, data) {
    productsArr = JSON.parse(data.toString());
    productID = productsArr[productsArr.length-1].id + 1 ;
    productsArr.forEach((prod) => {
        prod.reviews = [];
    })
    // console.log(productsArr);
})



//This gives you a 'client' object that you can use to interact with the database
const loadData = async() =>{
    //Connect to the mongo database.
    await connect('mongodb://localhost:27017/lab2');
 
    //Remove database and start anew.
    await connection.dropDatabase();
    let products = productsArr.map(a=>new Product(a));

    await Product.create(products);
    
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
