// Load required packages
var mongoose = require('mongoose');

// Define our expense schema
var ExpenseSchema   = new mongoose.Schema({
  date: String,
  time: String,
  description: String,
  amount: String,
  comment: String
});

// Export the Mongoose model
module.exports = mongoose.model('Expense', ExpenseSchema);
