//Import the mongoose module
import mongoose from 'mongoose';

const {Schema, model} = mongoose;

//Define the Schema for an order
let orderSchema = Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required:true
    },
    products : [{
        id: Number,
        name: String,
        quantity: Number
    }]

});

//Export the default so it can be imported
export default model("order", orderSchema);