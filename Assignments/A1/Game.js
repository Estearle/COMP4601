const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: String,
    link: String,
    numOfPlayers: [Number,Number],  
    playingTime: [Number,Number],
    recommendedAge: String,
    complexity:[Number,Number],
    categories:[String],
    fanAlsoLike:[String],
    incoming:[String],
    description:[String],
    pageRank: Number
})

module.exports = mongoose.model('Game', pageSchema);