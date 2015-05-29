// Load required packages
var config = require('./config/config.json');
var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var session = require('express-session');
var passport = require('passport');
var timezoneController = require('./controllers/timezone');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');
var oauth2Controller = require('./controllers/oauth2');
var clientController = require('./controllers/client');

// Connect to the timezoneapp MongoDB
var mongodbConnect = 'mongodb://'+config.mongodb.username + ':'+ config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db
mongoose.connect(mongodbConnect);
//mongoose.connect('mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/' + process.env.OPENSHIFT_APP_NAME);


// Create our Express application
var app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');

// Use the body-parser package in our application
/*
app.use(bodyParser.urlencoded({
  extended: true
}));
*/

// Use express session support since OAuth2orize requires it
app.use(session({ 
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));

// Use the passport package in our application
app.use(passport.initialize());

// Enable all CORS requests
app.use(cors());

// Create our Express router
var router = express.Router();

// Create endpoint handlers for /timezones
router.route('/api/timezones')
  .post(authController.isAuthenticated, timezoneController.postTimezones)
  .get(authController.isAuthenticated, timezoneController.getTimezones);

// Create endpoint handlers for /timezones/:timezone_id
router.route('/api/timezones/:timezone_id')
  .get(authController.isAuthenticated, timezoneController.getTimezone)
  .put(authController.isAuthenticated, timezoneController.putTimezone)
  .delete(authController.isAuthenticated, timezoneController.deleteTimezone);

// Create endpoint handlers for /users
router.route('/api/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers);

// Create endpoint handlers for /clients
router.route('/api/clients')
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients);

// Create endpoint handlers for oauth2 authorize
router.route('/api/oauth2/authorize')
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/api/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);

// Register all our routes
app.use(router);

// Start the server
var  port = process.env.OPENSHIFT_NODEJS_PORT || 9000
app.listen(port);
console.log('listening on port '+port);
