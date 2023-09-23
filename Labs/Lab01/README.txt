Lab 01
Rachel Wong 101184274
Earle Estrella 100907269

Lab Reflection Questions 
1. Describe the RESTful design of your implementation 
    a. What resources do you have and what is their sturcture?

    b. Which HTTP methods are you using for various operations and why?
    GET /products 
    to retrieve all the products 

    GET /products?name=Tasty
    to retreive all the products with name containing Tasty(or some other strings)

    GET /products?instock=1
    to retrieve all in stock products

    GET /products?name=Tasty&instock=1
    to retrieve in stock products with a specified string

    GET /search
    search page 

    POST /search 
    to retreive products 
    attribute:  name:string,
                type:string,
                checked:bool
    
    GET /add 
    add page 

    POST /add
    to create a new product and add it into the product array 
    attribute 
    to add products 
    attribute:  name: string, 
                price: Number, 
                dimensions: { x: Number, y: Number, z: Number }, 
                stock: Number

    GET /products/:productID
    to retrieve a specific product information by id and display its information

    POST /products/:productID/reviews
    to add a review to a specific product into a reviews array that accepts a json object
    as a review
    attribute:  rating: Number, 
                comment: string

    GET /products/:productID/reviews
    to retrieve a specific product's list of reviews along with input for new reviews
    new reviews are added to the list of reviews and is sorted by oldest to newest

    GET /products/:productID/reviews/:reviewID
    to retrieve a specific review for a specific item

    c. What is your URI naming scheme?
    For the products functionalities, the URI is /products or /products/:productID for a specific page
    Since reviews are tied to a specific product, the URI is /products/:productID/reviews
    For a specific review for a specific product, then the URI is /products/:productID/reviews/:reviewID
    
    d. What response codes are you sending and why?
    200 if successfully
    400 if the JSON string parsed from client does not match
    404 if unkown Product ID 
            
    

Demo video: https://www.youtube.com/watch?v=Lrb8VtDOP7c