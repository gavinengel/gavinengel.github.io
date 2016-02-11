
currentUser = {}

expensediv = {
  expenses: {},
  users: {},
  urls: {
    expense: "http://demo4555572.mockable.io/expense/",
    user: "http://demo4555572.mockable.io/user/"
  }
}

zeonic.ext.fetch = function (path, method, success, error) {
    var xhr = new XMLHttpRequest()
    method = method || 'get'
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success) success(JSON.parse(xhr.responseText))
            } else {
                if (error) error(xhr)
            }
        }
    }
    xhr.open(method.toUpperCase(), path, true)
    xhr.send()
}

zeonic.ext.expensesGet = function(e) {
  id = 12
  zeonic.ext.fetch( expensediv.urls.expense + id, 'get', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesGetAll = function(e) {
  zeonic.ext.fetch( expensediv.urls.expense, 'get', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesSet = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.expense + id, 'put', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesAdd = function(e) {
  zeonic.ext.fetch(expensediv.urls.expense + id, 'post', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesDel = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.expense + id, 'delete', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGet = function(e) {
  id = 12
  zeonic.ext.fetch('js/zeon.json', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGetAll = function(e) {
  zeonic.ext.fetch('js/zeon.json', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersSet = function(e) {
  id = 12
  zeonic.ext.fetch('js/zeon.json', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersAdd = function(e) {
  zeonic.ext.fetch('js/zeon.json', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersDel = function(e) {
  id = 12
  zeonic.ext.fetch('js/zeon.json', function(val){
    console.log(val)

  }, function(err){
    console.log(err)
  });
}

//##
//#user = { username:{} }
/*
// TODO eliminate a router library
var expensedivApp = angular.module('expensediv', ['ngRoute', 'ui.bootstrap',  'angular-storage', 'ngResource'])
.value('user_table', 'user')
.value('expense_table', 'expense')
.value('envoy', {name:'envoy'}) // carries data to views
.constant('ENDPOINT_URI', 'http://express.api.expensediv.engeldev.com/api/') 
/*.config(function($routeProvider) {
  $routeProvider
  .when('/home', {
    controller: 'HomeCtrl',
    templateUrl: 'partials/home.html'
  })
  .when('/users', {
    controller: 'UserCtrl',
    templateUrl: 'partials/user.html'
  })
  .when('/expenses', {
    controller: 'ExpenseCtrl',
    templateUrl: 'partials/expense.html'
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
})*/


