import express from 'express';
const app = express();
import {MongoClient, ObjectId} from 'mongodb';
import Product from "./Product.js"
import Order from "./Orders.js"

// import Review from "./Review.js"
import pkg from 'mongoose';
const { connect, Types } = pkg;
//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files
const ROOT_DIR_CSS = '/public/css'; //root directory for css files

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server
app.use(express.static(__dirname + ROOT_DIR_CSS)) //provide static server

//convert JSON stringified strings in a POST request to JSON
app.use(express.json());

app.set('views', './views')
app.set('view engine', 'pug')

// store all products 
app.get('/products', async (req, res) => {
    let name = req.query.name;
    let instock = req.query.instock;
    let searchResult = [];

    // all search 
    if(typeof name === "undefined" && typeof instock === "undefined"){
        console.log("ALL SEARCH");
        searchResult = await Product.find({}).sort("id");
    }
    
    // name search
    else if (typeof name !== 'undefined' && typeof instock === "undefined") {
        if (name.length > 0) {
            console.log("NAME SEARCH")
            searchResult = await Product.find({"name":new RegExp(name,'i')}).sort("id");
        }
    }
    //in stock search
    else if (typeof name === "undefined" && typeof instock !== "undefined"){
        //check if the user types an integer
        console.log("IN STOCK SEARCH")
        searchResult = await Product.find().where("stock").gt(0).sort("id");
    }
    // name + in stock search
    else{
        console.log("NAME + IN STOCK")
        searchResult = await Product.find({"name":new RegExp(name,'i')}).where("stock").gt(0).sort("id");
    }
    res.format({
        "application/json":function(){
			res.status(200).json(searchResult);
		},
		"text/html": () => {res.render('pages/products', { 'product': searchResult })}
    })
    
})

// search (GET Method)
app.get('/search', (req, res) => {
    let result = [];
    res.format({
        "application/json":function(){
			res.status(200).json(result);
		},
		"text/html": () => {res.render("pages/search", {result: result});
    }})}
)
    

//search (POST)
app.post('/search', async(req, res) => {
    let name = req.body.name;
    let searchType = req.body.type;
    let checked = req.body.checked;
    let searchResult = [];

    if (name.length > 0 && searchType === "name") {
        // name search + all search (same as name search)
        if (checked === false) {
            searchResult = await Product.find({"name":new RegExp(name,'i')}).sort("id");
        }

        // name search + in stock search
        else if (checked === true) {
            searchResult = await Product.find({"name":new RegExp(name,'i')}).where("stock").gt(0).sort("id");
        }
    }
    else if (name.length === 0 && checked === false) {
        //all search  
        if (searchType === "all") {
            searchResult = await Product.find({}).sort("id");
        }
        //in stock search
        else if (searchType === "inStock") {
            searchResult = await Product.find().where("stock").gt(0).sort("id");
        }
    }
    res.json(searchResult);
})

// create a new product 
app.get("/new-product",(req,res)=>{
    res.format({
        "application/json":function(){
			res.status(200);
		},
		"text/html": () => {res.render("pages/add")}
    })
    
})

app.post("/new-product",[verify,add]);

function verify(req,res,next){
    //check the JSON string
    if(!req.body){
        res.status(400).send("(1)JSON body required name,price,dimensions and initial stock quantity.Please check your format");
    }

    //Check that each required property exists
    const requiredContents = ["name","price","dimensions","stock"];
    
    for(let i = 0; i < requiredContents.length;i++){
        if(!req.body.hasOwnProperty(requiredContents[i])){
            console.log(requiredContents[i]);
            res.status(400).send("(2)JSON body required name,price,dimensions and initial stock quantity.Please check your format");
            return;
        }
    }
    next();
}

async function add(req,res,next){
    let productId = await Product.count();
    let addProduct = {
        name: req.body.name,
        price: req.body.price,
        dimensions : req.body.dimensions,
        stock : req.body.stock,
        id : productId ,
        reviews : []
    };
    let newProduct = await Product.create(new Product(addProduct));
    res.status(200).json(addProduct);
}

// view specific product
app.get("/products/:productID",async function(req,res,next){
    let prodID = req.params.productID;

    let prod = await Product.findOne({"id":prodID});

    if(!prod){
        res.status(404).send("Unknown Product ID " + prodID);
    }

    if(req.accepts("text/html")) {
        res.status(200).render("pages/product.pug", {product : prod})
    } else if(req.accepts("application/json")) {
        res.status(200).json(prod);
    }
});

// add a review for specific product
app.post('/products/:productID/reviews', async(req, res) => { 
    let prodID = req.params.productID;
    console.log("Product ID: " + prodID);
    console.log(req.body);
    let {rating, comment} = req.body;

    if (rating < 1 || rating > 10) {
        return res.status(400).send("Rating must be between 1 and 10");
    }

    let prod = await Product.findOne({"id":prodID});
    if(!prod){
        res.status(404).send("Unknown Product ID " + prodID);
    }
    let id = prod.reviews.length;
    let review = {  id,
                    rating,
                    comment  
    };
    console.log("REVIEW",review);
    let newProduct = await Product.findOneAndUpdate({"id":prodID},{$push:{"reviews":review}});
    console.log(newProduct);
    
    res.status(200).json(review);
});

// view reviews page
app.get("/products/:productID/reviews",async(req,res)=>{
    let prodID = req.params.productID;
    let prod = await Product.findOne({"id":prodID});
    console.log(prod.reviews);
    
    if(req.accepts("text/html")) {
        res.status(200).render("pages/reviews", {product : prod, reviews : prod.reviews });
    } else if(req.accepts("application/json")) {
        res.status(200).json(prod.reviews);
    }
})

// view specific review
app.get("/products/:productID/reviews/:reviewID",async function(req,res,next){
    let prodID = req.params.productID;
    let revID = req.params.reviewID;

    let prod = await Product.findOne({"id":prodID});
    if(!prod){
        res.status(404).send("Unknown Product ID " + prodID);
    }
    console.log(prod);
    let rev = await Product.findOne({"reviews.id":revID});
    if(!rev) {
        res.status(404).send("Unknown Product ID " + revID);
    }
    rev = rev.reviews[revID]
    // console.log(rev.reviews[revID]);

    if(req.accepts("text/html")) {
        res.status(200).render("pages/review.pug", {product : prod, review : rev})
    } else if(req.accepts("application/json")) {
        res.status(200).json(rev);
    }
});

// post order
app.post("/orders",[verifyOrder,addOrder]);

// check if the order is complete and has all the necessary info
async function verifyOrder(req,res,next){
    
    console.log(req.body);

    if (!req.body.name && req.body.products == 0) {
        res.status(409).send("Name and Products not entered.");
        return;
    } else if (!req.body.name) {
        res.status(409).send("Name not entered.");
        return;
    } else if (req.body.products == 0) {
        res.status(409).send("Products not entered.");
        return;
    } else { 
        let newOrder = {
            id: 0,
            name: req.body.name,
            products : req.body.products
        };
        
        for (let prod of newOrder.products) {
            let item = await Product.findOne({"id": prod.id});
            if (!item) {
                res.status(409).send("Product: " + prod.name +  " not found in database.");
                return;
            } else if (item.stock < prod.quantity) {
                res.status(409).send("There is not enough of product, " + prod.name +  ", in stock.");
                return; 
            }
        }
    }
    next();
}

// 
async function addOrder(req,res,next){
    let newOrder = {
        id: 0,
        name: req.body.name,
        products : req.body.products
    };

    newOrder.id = await Order.count();

    newOrder.products.forEach(async (prod) => {
        let item = await Product.findOne({"id": prod.id});
        let newStock = parseInt(item.stock) - parseInt(prod.quantity);
        await Product.findOneAndUpdate({"id": prod.id},{$set:{"stock":newStock}});
    });
    
    await Order.create(new Order(newOrder));
    res.status(201).json(newOrder);
}


// view orders
app.get("/orders",async(req,res)=>{
    let allOrders = await Order.find({}).sort("id");
    
    res.format({
        "application/json":function(){
			res.status(200).json(allOrders);
		},
		    "text/html": () => {res.render("pages/orders", {orders: allOrders});
        }
    })
})

// view specific order
app.get("/orders/:orderID",async(req,res)=>{
    let ordID = req.params.orderID;

    let ord = await Order.findOne({"id":ordID});

    if(!ord){
        res.status(404).send("Unknown Order ID " + ordID);
    }

    if(req.accepts("text/html")) {
        res.status(200).render("pages/order.pug", {order : ord})
    } else if(req.accepts("application/json")) {
        res.status(200).json(ord);
    }
})

// Create an async function to load the data.
// Other mongoose calls that return promise (connect) 
// inside the async function can use an await.
const loadData = async () => {
	
	//Connect to the mongo database
  	const result = await connect('mongodb://localhost:27017/lab2');

    return result;

};

// Call to load the data.
// Once the loadData Promise returns the express server will listen.
// Any errors from connect, dropDatabase or create will be caught 
// in the catch statement.
loadData()
  .then(() => {

    app.listen(PORT);
    console.log("Listen on port:", PORT);

  })
  .catch(err => console.log(err));