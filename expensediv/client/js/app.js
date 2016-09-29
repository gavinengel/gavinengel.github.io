document.onreadystatechange = function () {
    console.log(2)
}

/*
// Create the event.
var event = document.createEvent('Event');

// Define that the event name is 'build'.
event.initEvent('build', true, true);

// Listen for the event.
elem.addEventListener('build', function (e) {
  // e.target matches elem
}, false);

// target can be any Element or other EventTarget.
elem.dispatchEvent(event);
*/

///begin
/*
onabort: (...)
onerror: (...)
onload: (...)
onloadend: (...)
onloadstart: (...)
onprogress: (...)
*/
var s_ajaxListener = new Object();
s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.send;
/*
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onabort;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onerror;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onload;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onloadend;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onloadstart;
s_ajaxListener.tempSend = XMLHttpRequest.prototype.onprogress;
*/
s_ajaxListener.callback = function () {
  //console.log(6)
  // this.method :the ajax method used
  // this.url    :the url of the requested script (including query string, if any) (urlencoded) 
  // this.data   :the data sent, if any ex: foo=bar&a=b (urlencoded)
}
console.log('xhr:', XMLHttpRequest.prototype)

XMLHttpRequest.prototype.open = function(a,b) {
  //console.log(13)
  if (!a) var a='';
  if (!b) var b='';
  s_ajaxListener.tempOpen.apply(this, arguments);
  s_ajaxListener.method = a;  
  s_ajaxListener.url = b;
  if (a.toLowerCase() == 'get') {
    s_ajaxListener.data = b.split('?');
    s_ajaxListener.data = s_ajaxListener.data[1];
  }
}

XMLHttpRequest.prototype.send = function(a,b) {
  //console.log(26)
  if (!a) var a='';
  if (!b) var b='';
  s_ajaxListener.tempSend.apply(this, arguments);
  if(s_ajaxListener.method.toLowerCase() == 'post')s_ajaxListener.data = a;
  s_ajaxListener.callback();
}

XMLHttpRequest.prototype.response = function() { console.log(70); }
/*
XMLHttpRequest.prototype.onerror = function(a,b) { console.log(71); }
XMLHttpRequest.prototype.onload = function(a,b) { console.log(72); }
XMLHttpRequest.prototype.onloadend = function(a,b) { console.log(73); }
XMLHttpRequest.prototype.onloadstart = function(a,b) { console.log(74); }
XMLHttpRequest.prototype.onprogress = function(a,b) { console.log(75); }
*/

///end
function reqListener () {
  console.log('inside reqListener')
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", "http://demo4555572.mockable.io/user/12");
oReq.send();

///

$( "body" ).load(function() {
  console.log('Handler for .load() called.')
});


XMLHttpRequest.prototype.getResponseHeader = function() {
 console.log('O hai, looks like you made an AJAX request.');
}
///

var temp = XMLHttpRequest.getResponseHeader;
XMLHttpRequest.getResponseHeader = function() { console.log(24); };


//

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

// test post
/*
$.ajax({
    type: "POST",
    data: { date:'asdf', time:'asdf', amount:123, description:'asff', comment:'asdfasdf' },
    url: "http://localhost:9000/api/expense/",
    success: function success(data) {
        console.log('yaya')
    },
    cache: false
});
*/
// listeners
$("#add_user_modal").on('show.bs.modal', function (e) {
  if ($(e.relatedTarget).hasClass('btn-edit')) {
    //zeonic.ext.usersGet(e, e.relatedTarget['data-id'], zeonic.ext.fillUserModal)  
  }
});
$("#add_expense_modal").on('show.bs.modal', function (e) {
  if ($(e.relatedTarget).hasClass('btn-edit')) {
    //zeonic.ext.expensesGet(e, e.relatedTarget['data-id'], zeonic.ext.fillExpenseModal)  
  }
});


/*
zeonic.ext.isLoggedIn = function() {
  return true
}

zeonic.ext.hideModal = function(){
  //$('.modal').modal('hide');
}

zeonic.ext.fillTable = function(tableId, key, data) {

  $.each(data[key], function (index, value) {
      var row = ''

      if (tableId == 'usersTable')
      {
        row = '<tr><td>'+value.id+'</td><td>'+value.username+'</td><td>'+value.name+'</td><td>'+value.role+'</td><td data-title="action"><button type="button" class="btn btn-info btn-lg btn-edit" data-toggle="modal" data-target="#add_user_modal" data-id="'+value.id+'"><i class="icon-white icon-pencil"></i> Edit</button><a class="btn btn-default btn-xs">Delete</a></td></tr>'
      }
      else {
        row = '<tr><td>'+value.id+'</td><td>'+value.date+'</td><td>'+value.time+'</td><td>'+value.description+'</td><td>'+value.amount+'</td><td>'+value.comment+'</td><td data-title="action"><button type="button" class="btn btn-info btn-lg btn-edit" data-toggle="modal" data-target="#add_expense_modal" data-id="'+value.id+'"><i class="icon-white icon-pencil"></i> Edit</button><a class="btn btn-default btn-xs">Delete</a></tr>'
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
zeonic.ext.fillUserModal = function(data){
  console.log('fill usssssssssssss', data)
  $('#add_user_modal #username').attr('value', data.username)
  $('#add_user_modal #name').attr('value', data.name)
  $('#add_user_modal #role').attr('value', data.role)
  $('#add_user_modal #expenseAmount').attr('value', data.amount)
}

zeonic.ext.fillExpenseModal = function(data){
  console.log('aaaaaaaaaa', data)
  $('#add_expense_modal #expenseDate').attr('value', data.date)
  $('#add_expense_modal #expenseTime').attr('value', data.time)
  $('#add_expense_modal #expenseDescription').attr('value', data.description)
  $('#add_expense_modal #expenseAmount').attr('value', data.amount)
  $('#add_expense_modal #expenseComment').attr('value', data.comment)
}

zeonic.ext.expensesGet = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch( expensediv.urls.base + expensediv.urls.expense + id, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()
    if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesGetAll = function(e, callback) {
  zeonic.ext.fetch( expensediv.urls.base + expensediv.urls.expense, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()

    zeonic.ext.fillTable('expensesTable', 'expenses', data)
if (callback) callback(data)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesSet = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense + id, 'put', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesAdd = function(e, callback) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense, 'post', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.expensesDel = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.expense + id, 'delete', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGet = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()
    if (callback) callback(data)

  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersGetAll = function(e, callback) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user, 'get', function(data){
    console.log(data)
    zeonic.ext.hideModal()
    zeonic.ext.fillTable('usersTable', 'users', data)
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersSet = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'put', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersAdd = function(e, callback) {
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user, 'post', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}

zeonic.ext.usersDel = function(e, id, callback) {
  id = 12
  zeonic.ext.fetch(expensediv.urls.base + expensediv.urls.user + id, 'delete', function(data){
    console.log(data)
    zeonic.ext.hideModal()
if (callback) callback(data)
  }, function(err){
    console.log(err)
  });
}
*/
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


