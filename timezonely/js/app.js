var timezonelyApp = angular.module('timezonely', ['ngRoute', 'firebase', 'ui.bootstrap',  'angular-storage', 'ui.router', 'ngResource'])
.value('fbURL', 'https://timezonely.firebaseio.com/')
.value('user_table', 'user')
.value('timezone_table', 'timezone')
.value('envoy', {valid: true})
.constant('ENDPOINT_URI', 'http://ovh.engeldev.com:9000/api/') // this is the timezones api
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


