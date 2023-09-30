Lab 02
Rachel Wong 101184274
Earle Estrella 100907269

NOTE: Products.json has one change for demonstration purposes. The stock of the first product(Tasty Cotton Chair) went down to 0 to show name+instock search works.

Lab Reflection Questions 

1. Discuss the collections and documents that you store in the database (e.g., what data are you storing about products, orders, etc.).
Collection : Product
Collection Schema of a Product (document):
    name: String,
    price: Number,
    dimensions:{x:Number,
                y:Number,
                z:Number}
    stock: Number,
    id:Number.
    reviews : [{
        id: Number,
        rating:{type:Number,
            min:[0],
            max:[10]
        },
        comment: String
    }]

The product's name, price, dimensions, stock, and id (not _id) consist the minimum required information when adding a new product. and will be displayed on the associated product page .
The reviews array are defaulted to be empty unless the products from products.json contain any reviews object. Each review has its unique id for counting the numbers of reviews we have under each product. 
The rating is required for each review, while a comment is not mandatory. The rating can only range from 0 to 10.

Collection : Order
Collection Schema of a Order (document):
    id: Number,
    name: String,
    products : [{
        id: Number,
        name: String,
        quantity: Number
    }]

The ID of the order is used to maintain a second ID other than the MongoDB ID for the order itself.
The name is to attach a customer name to a specific order.

In the Products array, the ID and name is used to compare ID and name of product between order and product collections.
The quantity tells us the amount that is being ordered.


2. What is the structure of your new order data? How is it sent to the server (e.g., through an HTML form, JSON request)?
Orders are being sent to the server via JSON requests through Postman.
This includes valid orders as well as orders that are missing information, item does not exist or if the item requested amount is more than the available in stock.
The order data is structured as follows:
    newOrder = {
        id: Number,
        name: String,
        products : [{ 
		id: Number,
        	name: String,
        	quantity: Number
	}]
    };

3. How do you load the data for a specific order so it can be displayed to the user?
If an order is clicked from the list of orders made, a GET request is sent to the server to view the specifics of that order.
This includes order ID number, customer name and the list of products that are part of the order as links to the product.


Demo video: https://www.youtube.com/watch?v=ayCshb1NALA