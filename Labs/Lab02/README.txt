Lab 02
Rachel Wong 101184274
Earle Estrella 100907269

NOTE: 

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


2. What is the structure of your new order data? How is it sent to the server (e.g., through an HTML form, JSON request)?
3. How do you load the data for a specific order so it can be displayed to the user?


Demo video: 