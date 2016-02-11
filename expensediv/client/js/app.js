
currentUser = {}

expensediv = {
  expenses: {},
  users: {},
  urls: {
    base: "http://demo4555572.mockable.io/",
    expense: "expense/",
    user: "user/"
  }
}

zeonic.ext.isLoggedIn = function() {
  return true
}

zeonic.ext.hideModal = function(){
  $('.modal').modal('hide');
}

zeonic.ext.fillTable = function(tableId, key, data) {

  $.each(data[key], function (index, value) {
      var row = ''

      if (tableId == 'usersTable')
      {
        row = '<tr><td>'+value.id+'</td><td>'+value.username+'</td><td>'+value.name+'</td><td>'+value.role+'</td><td data-title="action"><a href="" class="btn btn-primary btn-xs">Edit</a><a class="btn btn-default btn-xs">Delete</a></td></tr>'
      }
      else {
        row = '<tr><td>'+value.id+'</td><td>'+value.date+'</td><td>'+value.time+'</td><td>'+value.description+'</td><td>'+value.amount+'</td><td>'+value.comment+'</td><td data-title="action"><a href="" class="btn btn-primary btn-xs">Edit</a><a class="btn btn-default btn-xs">Delete</a></tr>'
      }

      $('#' + tableId).append(row)
  });

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
  zeonic.ext.fetch( expensediv.urls.base + expensediv.urls.expense + id, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesGetAll = function(e) {
  zeonic.ext.fetch( expensediv.urls.base + expensediv.urls.expense, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()

    zeonic.ext.fillTable('expensesTable', 'expenses', data)


  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesSet = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense + id, 'put', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesAdd = function(e) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense, 'post', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesDel = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense + id, 'delete', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGet = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGetAll = function(e) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()
    zeonic.ext.fillTable('usersTable', 'users', data)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersSet = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'put', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersAdd = function(e) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user, 'post', function(data){
    console.log(data)
    zeonic.ext.hideModal()

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersDel = function(e) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'delete', function(data){
    console.log(data)
    zeonic.ext.hideModal()

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


