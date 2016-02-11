// Load required packages
var Expense = require('../models/expense');


// Create endpoint /api/expenses for POST
exports.postExpenses = function(req, res) {
  // Create a new instance of the Expense model
  var expense = new Expense();

  // Set the expense properties that came from the POST data
  expense.userId = req.user._id;
  expense.city = req.query.city;
  expense.zonename = req.query.zonename;
  expense.difference = req.query.difference;

  // Save the expense and check for errors
  expense.save(function(err) {
    if (err) res.send(err);

    res.json({ message: 'Expense added to the app!', data: expense, req: req.query });
  });
};

// Create endpoint /api/expenses for GET
exports.getExpenses = function(req, res) {
  // Use the Expense model to find all expense
  Expense.find({ userId: req.user._id }, function(err, expenses) {
    if (err) res.send(err);

    res.json(expenses);
  });
};

// Create endpoint /api/expenses/:expense_id for GET
exports.getExpense = function(req, res) {
  // Use the Expense model to find a specific expense
  Expense.find({ userId: req.user._id, _id: req.params.expense_id }, function(err, expense) {
    if (err)
      res.send(err);

    res.json(expense);
  });
};

// Create endpoint /api/expenses/:expense_id for PUT
exports.putExpense = function(req, res) {
  // Use the Expense model to find a specific expense
  //Expense.update({ userId: req.user._id, _id: req.params.expense_id }, { quantity: req.query.quantity }, function(err, num, raw) {
  Expense.update(
    { _id: req.params.expense_id }, 
    { city: req.query.city, difference: req.query.difference, zonename: req.query.zonename }, 
    function(err, num, raw) {  
    if (err) {   console.log('error in updating...')

      res.send(err);
    }

    res.json({ message: num + ' updated' });
  });
};

// Create endpoint /api/expenses/:expense_id for DELETE
exports.deleteExpense = function(req, res) {
  // Use the Expense model to find a specific expense and remove it
  Expense.remove({ userId: req.user._id, _id: req.params.expense_id }, function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'Expense removed from the app!' });
  });
};
