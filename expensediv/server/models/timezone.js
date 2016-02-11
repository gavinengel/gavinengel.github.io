// Load required packages
var mongoose = require('mongoose');

// Define our expense schema
var ExpenseSchema   = new mongoose.Schema({
  city: String,
  zonename: String,
  difference: String,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('Expense', ExpenseSchema);
