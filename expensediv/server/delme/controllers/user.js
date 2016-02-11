// Load required packages
var User = require('../models/user');
require('magic-globals')
var log = console.log

// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    username: req.query.username,
    password: req.query.password
  });

  // Set the user properties that came from the POST data
  user.name = req.query.name;
  user.designation = req.query.designation;
  user.gender = req.query.gender;
  user.dob = req.query.dob;

  user.save(function(err) {
    if (err) {
      log('Error: '+__fili)
      log(user)
      log(err)
      res.send(err);
    }
    res.json({ message: 'New user user added to the app!' });
    log(__fili)
  });

};

// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
};


// Create endpoint /api/users/:user_id for GET
exports.getUser = function(req, res) {
  // Use the User model to find a specific user
  User.find({ _id: req.params.user_id }, function(err, user) {
    if (err) {
      log({"ERROR": [__fili, err, user]})
      res.send(err);
    }

    res.json(user);
  });
};

// Create endpoint /api/users/login/:username for GET
exports.getUsername = function(req, res) {
  // Use the User model to find a specific user by username
  User.find({ username: req.user.username }, function(err, user) {
    if (err) {
      log({"ERROR": [__fili, err, user]})
      res.send(err);
    }

    res.json(user);
  });
};

// Create endpoint /api/users/:user_id for PUT
exports.putUser = function(req, res) {
  // Use the User model to find a specific user
  User.update(
    { _id: req.params.user_id }, 
    { 
      username: req.query.username,
      name: req.query.name, 
      password: req.query.password,
      designation: req.query.designation, 
      //gender: req.query.gender, 
      //dob: req.query.dob 
    }, 
    function(err, num, raw) {  
    if (err) {   
      log({"ERROR": [__fili, err, num, raw]})
      res.send(err);
    }
    log({"SUCCESS": [__fili, req.query]})

    res.json({ message: num + ' updated' });
  });
};

// Create endpoint /api/users/:user_id for DELETE
exports.deleteUser = function(req, res) {
  // Use the User model to find a specific user and remove it
  User.remove({ _id: req.params.user_id }, function(err) {
    if (err) {
      log({"ERROR": [__fili, err]})
      res.send(err);
    }
    res.json({ message: 'User removed from the app!' });
  });
};
