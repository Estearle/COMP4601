//Import the mongoose module
import mongoose from 'mongoose';

const { Schema, model} = mongoose;


//Define the Schema for a review 
// let reviewSchema = Schema ({
//     type:{
//         id:{type:Number},
        // rating:{type:Number,
        //     min:[0],
        //     max:[10]
        // },
        // comment: String
//     },
//     default:[]

// })

//Define the Schema for a product
let productSchema = Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required:true
    },
    dimensions: {
        type:{
            x:{type:Number},
            y:{type:Number},
            z:{type:Number}
        },
        _id:false
    },
    stock :{
        type: Number,
        required: true
    } ,
    id:{
        type:Number,
        required:true
    },
    reviews : [{
        id: Number,
        rating:{type:Number,
            min:[0],
            max:[10]
        },
        comment: String
    }]

});

//Export the default so it can be imported
export default model("product", productSchema);