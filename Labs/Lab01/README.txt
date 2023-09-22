Lab 01
Name: Rachel Wong, Earle Estrella

Lab Reflection Questions 
1. Describe the RESTful design of your implementation 
    a. What resources do you have and what is their sturcture?
    b. Which HTTP methods are you using for various operations and why?
    GET /products 
    to retrieve all the products 

    GET /products?name=Tasty
    to retreive all the products with name containing Tasty(or some other strings)

    GET /prodcuts?instock=1
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

    c. What is your URI naming scheme?
    
    
    d. What response codes are you sending and why?
    200 if successfully
    400 if the JSON string parsed from client does not match
    404 if unkown Product ID 
            



    

Demo video: