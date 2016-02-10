// TODO eliminate a router library
var expensedivApp = angular.module('expensediv', ['ngRoute', 'ui.bootstrap',  'angular-storage', 'ui.router', 'ngResource'])
.value('user_table', 'user')
.value('timezone_table', 'timezone')
.value('envoy', {name:'envoy'}) // carries data to views
.constant('ENDPOINT_URI', 'http://express.api.expensediv.engeldev.com/api/') 
.config(function($routeProvider) {
  $routeProvider
  .when('/home', {
    controller: 'HomeCtrl',
    templateUrl: 'partials/home.html'
  })
  .when('/users', {
    controller: 'UserCtrl',
    templateUrl: 'partials/user.html'
  })
  .when('/timezones', {
    controller: 'TimezoneCtrl',
    templateUrl: 'partials/timezone.html'
  })
  .when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'partials/login.html'
  })
  .when('/dashboard', {
    controller: 'DashboardCtrl',
    templateUrl: 'partials/dashboard.html'
  })
  .otherwise({
    redirectTo: '/home'
  });
})


