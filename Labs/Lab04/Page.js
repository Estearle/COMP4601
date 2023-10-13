const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title:String,
  link: String,
  outgoing:[String],
  incoming:[String],
  content: [String]
});

module.exports = mongoose.model('Page', pageSchema);


