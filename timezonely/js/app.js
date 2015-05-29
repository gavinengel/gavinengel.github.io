var timezonelyApp = angular.module('timezonely', ['ngRoute', 'ui.bootstrap',  'angular-storage', 'ui.router', 'ngResource'])
.value('user_table', 'user')
.value('timezone_table', 'timezone')
.value('envoy', {name:'envoy'}) // carries data to views
.constant('ENDPOINT_URI', 'http://express.api.timezonely.engeldev.com/api/') 
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
    .otherwise({
        redirectTo: '/home'
    });
})


