// Load required packages
var mongoose = require('mongoose');

// Define our timezone schema
var TimezoneSchema   = new mongoose.Schema({
  name: String,
  type: String,
  quantity: Number,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Timezone', TimezoneSchema);