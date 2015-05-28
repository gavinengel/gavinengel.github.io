// Load required packages
var Timezone = require('../models/timezone');


// Create endpoint /api/timezones for POST
exports.postTimezones = function(req, res) {
  // Create a new instance of the Timezone model
  var timezone = new Timezone();

  // Set the timezone properties that came from the POST data
  timezone.userId = req.user._id;
  timezone.city = req.query.city;
  timezone.designation = req.query.designation;
  timezone.zonename = req.query.zonename;
  timezone.difference = req.query.difference;

  // Save the timezone and check for errors
  timezone.save(function(err) {
    if (err) res.send(err);

    res.json({ message: 'Timezone added to the app!', data: timezone, req: req.query });
  });
};

// Create endpoint /api/timezones for GET
exports.getTimezones = function(req, res) {
  console.log(26)
  // Use the Timezone model to find all timezone
  Timezone.find({ userId: req.user._id }, function(err, timezones) {
    console.log(27)
    if (err) res.send(err);
    console.log(28)

    res.json(timezones);
    console.log(29)
  });
};

// Create endpoint /api/timezones/:timezone_id for GET
exports.getTimezone = function(req, res) {
  // Use the Timezone model to find a specific timezone
  Timezone.find({ userId: req.user._id, _id: req.params.timezone_id }, function(err, timezone) {
    if (err)
      res.send(err);

    res.json(timezone);
  });
};

// Create endpoint /api/timezones/:timezone_id for PUT
exports.putTimezone = function(req, res) {
  console.log('updating...')
  // Use the Timezone model to find a specific timezone
  //Timezone.update({ userId: req.user._id, _id: req.params.timezone_id }, { quantity: req.query.quantity }, function(err, num, raw) {
  Timezone.update(
    { _id: req.params.timezone_id }, 
    { city: req.query.city, designation: req.query.designation, difference: req.query.difference, zonename: req.query.zonename }, 
    function(err, num, raw) {  
    if (err) {   console.log('error in updating...')

      res.send(err);
    }

console.log('req :')
console.log(req)

console.log('req params:')
console.log(req.params)

console.log('req.query is:')
console.log(req.query)

  console.log('updating num is:')
  console.log(num)

    res.json({ message: num + ' updated' });
  });
};

// Create endpoint /api/timezones/:timezone_id for DELETE
exports.deleteTimezone = function(req, res) {
  console.log('delete1')
  // Use the Timezone model to find a specific timezone and remove it
  Timezone.remove({ userId: req.user._id, _id: req.params.timezone_id }, function(err) {
    if (err)
      res.send(err);
console.log('delete2')
    res.json({ message: 'Timezone removed from the app!' });
    console.log('delete3')
  });
};
