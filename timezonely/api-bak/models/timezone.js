// Load required packages
var mongoose = require('mongoose');

// Define our timezone schema
var TimezoneSchema   = new mongoose.Schema({
  city: String,
  designation: String,
  zonename: String,
  difference: String,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Timezone', TimezoneSchema);
