const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: String,
    officialLinks: String,
    numOfPlayers: Number,  
    playingTime: Number,
    recommendedAge: Number,
    complexity:String,
    categories:[String],
    reviews:[String],
    fanAlsoLike:[String],
    rating:Number
})