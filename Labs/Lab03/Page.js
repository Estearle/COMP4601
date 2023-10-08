const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  link: String,
  outgoing:[String],
  incoming:[String],
  content: [String]
});

module.exports = mongoose.model('Page', pageSchema);


