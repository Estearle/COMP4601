const express = require('express');
const app = express();
const fs = require('fs');

//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files

app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server

//convert JSON stringified strings in a POST request to JSON
app.use(express.json());

app.set('views', './views')
app.set('view engine', 'pug')

// product array 
let product;
let productID = 0;
//read the JSON file and store all the products
fs.readFile('products.json', 'utf8', function (err, data) {
    product = JSON.parse(data.toString());
    productID = product[product.length-1].id + 1 ;
    product.forEach((prod) => {
        prod.reviews = [];
    })
})

// store all products 
app.get('/products', (req, res) => {
    let name = req.query.name;
    let instock = req.query.instock;
    let result = [];

    // all search 
    if(typeof name === "undefined" && typeof instock === "undefined"){
        console.log("ALL SEARCH")
        result = product;
    }
    
    // name search
    else if (typeof name !== 'undefined' && typeof instock === "undefined") {
        if (name.length > 0) {
            console.log("NAME SEARCH")
            for (let i in product) {
                if (product[i].name.toLowerCase().includes(name.toLowerCase())) {
                    result.push(product[i]);
                }
            }
        }
    }
    //in stock search
    else if (typeof name === "undefined" && typeof instock !== "undefined"){
        //check if the user types an integer
        console.log("IN STOCK SEARCH")
        if(Number.isInteger(Number(instock))){
            for(let i in product){
                if(parseInt(product[i].stock) >= 1){
                    result.push(product[i]);
                }
            }
        }
    }
    // name + in stock search
    else{
        console.log("NAME + IN STOCK")
        if (name.length > 0 && Number.isInteger(Number(instock))) {
            for (let i in product) {
                if (product[i].name.toLowerCase().includes(name.toLowerCase()) && parseInt(product[i].stock) >= 1) {
                    result.push(product[i]);
                }
            }
        }
    }
    res.render('pages/products', { 'product': result });
})

// search (GET Method)
app.get('/search', (req, res) => {
    let result = [];
    res.render("pages/search", { product: product, result: result });
})

//search (POST)
app.post('/search', (req, res) => {
    let name = req.body.name;
    let searchType = req.body.type;
    let checked = req.body.checked;
    let result = [];

    if (name.length > 0 && searchType === "name") {
        // name search + all search (same as name search)
        if (checked == false) {
            for (let i in product) {
                if (product[i].name.toLowerCase().includes(name.toLowerCase())) {
                    result.push(product[i]);
                }
            }
        }

        // name search + in stock search
        else if (checked == true) {
            for (let i in product) {
                if (product[i].name.toLowerCase().includes(name.toLowerCase()) && product[i].stock > 0) {
                    result.push(product[i]);
                }
            }
        }
    }
    else if (name.length === 0 && checked === "none") {
        //all search  
        if (searchType === "all") {
            result = product;
        }
        //in stock search
        else if (searchType === "inStock") {
            for (let i in product) {
                if (product[i].stock > 0) {
                    result.push(product[i]);
                }
            }
        }
    }
    console.log(result);
    res.json(result);
})

// create a new product 
app.get("/add",(req,res)=>{
    res.render("pages/add",);
})

app.post("/add",[verify,add]);

function verify(req,res,next){
    //check the JSON string
    if(!req.body){
        res.status(400).send("JSON body required name,price,dimensions and initial stock quantity.Please check your format");
    }

    //Check that each required property exists
    const requiredContents = ["name","price","dimensions","stock"];
    for(let i = 0; i < requiredContents.length;i++){
        if(!req.body.hasOwnProperty(requiredContents[i])){
            res.status(400).send("JSON body required name,price,dimensions and initial stock quantity.Please check your format");
            return;
        }
    }
    next();
}

function add(req,res,next){
    let addProduct = {
        name: req.body.name,
        price: req.body.price,
        dimensions : req.body.dimensions,
        stock : req.body.stock,
        id : productID,
        reviews : []
    };
    product.push(addProduct) ;
    productID++;
    console.log(addProduct);
    res.status(200).json(addProduct);
}

// view specific product
app.get("/products/:productID", function(req,res,next){
    let prodID = req.params.productID;

    if(!product.hasOwnProperty(prodID)) {
        res.status(404).send("Unknown Product ID " + prodID);
    }

    let prod = product[prodID];
    if(req.accepts("text/html")) {
        res.status(200).render("pages/product.pug", {product : prod})
    } else if(req.accepts("application/json")) {
        res.status(200).json(prod);
    }
});

// add a review for specific product
app.post('/products/:productID/reviews', (req, res) => { 
    let prodID = req.params.productID;
    console.log("Product ID: " + prodID);
    if(!product.hasOwnProperty(prodID)) {
        res.status(404).send("Unknown Product ID " + prodID);
    }
    console.log(req.body);
    let {rating, comment} = req.body;

    if (rating < 1 || rating > 10) {
        return res.status(400).send("Rating must be between 1 and 10");
    }

    let id = product[prodID].reviews.length;

    let review = {  id,
                    rating,
                    comment  
    };
    console.log(review);
    
    product[prodID].reviews.push(review);
    res.status(200).json(review);
});

// view reviews page
app.get("/products/:productID/reviews",(req,res)=>{
    let prodID = req.params.productID;
    let prod = product[prodID];
    console.log(prod);
    res.render("pages/reviews", {product : prod, reviews : prod.reviews });
})

// view specific review
app.get("/products/:productID/reviews/:reviewID", function(req,res,next){
    let prodID = req.params.productID;
    let revID = req.params.reviewID;

    if(!product.hasOwnProperty(prodID)) {
        res.status(404).send("Unknown Product ID " + prodID);
    }

    if(!product.hasOwnProperty(revID)) {
        res.status(404).send("Unknown Product ID " + revID);
    }

    let prod = product[prodID];
    let rev = prod.reviews[revID];
    if(req.accepts("text/html")) {
        res.status(200).render("pages/review.pug", {product : prod, review : rev})
    } else if(req.accepts("application/json")) {
        res.status(200).json(rev);
    }
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");