// TODO remove mentions of dashboard
// TODO remove all firebase stuff
// TIMEZONES //////////////////////////////////////////////////////////////////

expensedivApp.controller('ExpenseCtrl', function(envoy, $scope, $modal, $location, $routeParams, expense_table, filterFilter, UserService, ExpensesService, store) {
    UserService.auth()

    // Define variables
    envoy.ExpenseCtrl = true;

    $scope.alerts = [];     // array of alert message objects.

    // Remove expense
    $scope.removeRecord = function(expenseId) {
      $scope.alerts.splice(0, 1);
      $scope.alerts.push({
        type: 'success',
        msg: "expense removed successfully!"
      });

      ExpensesService.destroy(expenseId)
      .then(function (result) {
        cancelEditing();
        $scope.getExpenses();
      });
    };

    // Close alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    // Modal: called by edit(expenseId) and Add new expense
    $scope.open = function(expenseId) {
      var modalInstance = $modal.open({
        templateUrl: 'add_expense_modal',
        controller: $scope.model,
        resolve: {
          id: function() {
            return expenseId;
          }
        }
      });
    };

    $scope.getLocalTime = function(expense) {

    };

    var dashboard = this;

    $scope.getExpenses = function() {
      ExpensesService.fetchAll()
      .then(function (result) {
            dashboard.expenses = result.data;//debug
            envoy.expenses = result.data;
          });
    };

    $scope.createExpense = function(expense) {
      ExpensesService.create(expense)
      .then(function (result) {
            //initCreateForm();
            $scope.getExpenses();
            $modalInstance.dismiss('cancel');

          });
    };

    function updateExpense(expense) {
      alert('in updateExpenses')
      ExpensesService.update(expense.id, expense)
      .then(function (result) {
        cancelEditing();
        $scope.getExpenses();
      });
    }

    function deleteExpense(expenseId) {
      alert('in deleteExpense')
      ExpensesService.destroy(expenseId)
      .then(function (result) {
        cancelEditing();
        $scope.getExpenses();
      });
    }

    //function initCreateForm() {
    //    dashboard.newExpense = { name: '', description: '' };
    //}

    function setEditedExpense(expense) {
      dashboard.editedExpense = angular.copy(expense);
      dashboard.isEditing = true;
    }

    function isCurrentExpense(expenseId) {
      return dashboard.editedExpense !== null && dashboard.editedExpense.id === expenseId;
    }

    function cancelEditing() {
      dashboard.editedExpense = null;
      dashboard.isEditing = false;
    }

    dashboard.expenses = [];
    dashboard.editedExpense = null;
    dashboard.isEditing = false;
    dashboard.getExpenses = $scope.getExpenses;
    dashboard.createExpense = $scope.createExpense;
    dashboard.updateExpense = updateExpense;
    dashboard.deleteExpense = deleteExpense;
    dashboard.setEditedExpense = setEditedExpense;
    dashboard.isCurrentExpense = isCurrentExpense;
    dashboard.cancelEditing = cancelEditing;

    $scope.model = function(envoy, $scope, $modalInstance, id, expense_table) {
      envoy.model = true;
      $scope.expense = {};
      $scope.alerts = []; // array of alert message objects.

      if (angular.isDefined(id)) {
        ExpensesService.fetch(id)
        .then(function (res) {
          $scope.expense = res.data[0];
        });
      }

      // close modal
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      // Add new expense
      $scope.add = function() {
        ExpensesService.create($scope.expense)
        .then(function (result) {

          ExpensesService.fetchAll()
          .then(function (result) {
            envoy.expenses = result.data;
          });

          //initCreateForm();
          $modalInstance.dismiss('cancel');

        })

      }

      // Save edited expense.
      $scope.save = function() {
        ExpensesService.update($scope.expense._id, $scope.expense)
        .then(function (res) {
          ExpensesService.fetchAll()
          .then(function (result) {
            envoy.expenses = result.data;
          });
          //initCreateForm();
          $modalInstance.dismiss('cancel');
        })
      };
    };
    
    // controller final
    //initCreateForm();
    $scope.getExpenses();
    $scope.envoy = envoy //TODO
  })

expensedivApp.service('ExpensesService', function($http, ENDPOINT_URI, envoy, store, UserService) {
  var service = this,
  path = 'expenses/';

  function getUrl(addCredentials, id) {
    var url = ENDPOINT_URI + path

    if (id) {
      url = url + id
    }
    if (addCredentials) {
      credentials = UserService.getCurrentUser() //store.get('user')
      if (angular.isDefined(credentials)) {
        url = url + "?username=" + credentials.username + "&password=" + credentials.password  
      }
      
    }
    return  url
  }

  function getUrlForId(expenseId) {
        return getUrl(path, expenseId) //+ "?username=" + credentials.username + "&password=" + credentials.password
      }
/*
      function addCredentials(data) {
        credentials = getCredentials()
        data.username = credentials.username;
        data.password = credentials.password;
        return data;
      }

      function getCredentials() {
        // TODO this is a stub
        var credentials = {}
        credentials.username = 'gavin';
        credentials.password = 'engel';
        return credentials;
      }
*/
      service.fetchAll = function () {
        return $http.get(getUrl(true));
      };

      service.fetch = function (expenseId) {

        return $http.get(getUrlForId(expenseId));

      };

      service.create = function (expense) {
        expense = addCredentials(expense)
        return $http({
          url: getUrl(),
          method: "POST",
          params: expense,
        }).success(function (data, status, headers, config) {
            //TODO
          })
      };

      service.update = function (expenseId, expense) {
        var url = getUrlForId(expenseId);
        url = url + '&city=' + expense.city + '&designation=' + expense.designation + '&difference=' + expense.difference + '&expenseName=' + expense.expenseName
        return $http.put(url, expense); //TODO figure out why params aren't being sent:
      };

      service.destroy = function (expenseId) {
        var url = getUrlForId(expenseId);
        return $http.delete(url);
      };
    })

// USERS //////////////////////////////////////////////////////////////////////


expensedivApp.controller('UserCtrl', function($scope, $modal, $location, envoy, $routeParams, user_table, filterFilter, UserService) {
    UserService.auth()

    // Define valiables
    $scope.alerts = [];     // array of alert message objects.
    var dashboard = this;

    // Remove user
    $scope.removeRecord = function(userId) {
      $scope.alerts.splice(0, 1);
      $scope.alerts.push({
        type: 'success',
        msg: "user removed successfully!"
      });

      UserService.destroy(userId)
      .then(function (result) {
        $scope.getUsers();
      });
    };

    // Close alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    // Modal: called by edit(userId) and Add new user
    $scope.open = function(userId) {
      var modalInstance = $modal.open({
        templateUrl: 'add_user_modal',
        controller: $scope.model,
        resolve: {
          id: function() {
            return userId;
          }
        }
      });
    };

/* TODO
    $scope.setEnvoy = function(key, val) {
      envoy[key] = val
      $scope.envoy = envoy
      cancelEditing();
    }
    */

    $scope.model = function($scope, envoy, $modalInstance,  id, user_table) {
      $scope.user = {};
        $scope.alerts = [];         // array of alert message objects.
        $scope.designations = [{
          name: 'Regular',
          value: "Regular"
        }, {
          name: 'Manager',
          value: "Manager"
        }];

        if (angular.isDefined(id)) {
          UserService.fetch(id)
          .then(function (res) {
            $scope.user = res.data[0];
            //console.log({'editing user' : $scope.user})
          });
        }

        // close modal
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };

      // Add new user
      $scope.add = function() {
        //console.log(364)
        UserService.create($scope.user)
        .then(function (result) {
          //console.log(366)
          UserService.fetchAll()
          .then(function (result) {
            //console.log(369)
            envoy.users = result.data;
            //$scope.setEnvoy('users', result.data)
            $modalInstance.dismiss('cancel');
            //console.log(373)
          });

        })

      }

      // Save edited user.
      $scope.save = function() {
        UserService.update($scope.user._id, $scope.user)
        .then(function (res) {
          UserService.fetchAll()
          .then(function (result) {
            envoy.users = result.data;
            //$scope.setEnvoy('users', result.data)
            $modalInstance.dismiss('cancel');

          });

        })
      };

    }; // end model

    $scope.getUsers = function() {
      UserService.fetchAll()
      .then(function (result) {
        envoy.users = result.data;
        //$scope.setEnvoy('users', result.data)

      });
    };

    function cancelEditing() {
      dashboard.editedExpense = null;
      dashboard.isEditing = false;
    }

    // controller final
    $scope.getUsers()
        $scope.envoy = envoy //TODO

      })

expensedivApp.service('UserService', function($http, $location, ENDPOINT_URI, envoy, store) {
  var service = this,
  currentUser = null,
  path = 'users/';

  service.setCurrentUser = function(user) {
    currentUser = user;
    store.set('user', user);
    return currentUser;
  };

  service.getCurrentUser = function() {
    if (!currentUser) {
      currentUser = store.get('user');
    }
    return currentUser;
  };

    ///////////////////

    function getUrl(addCredentials, id) {
      var url = ENDPOINT_URI + path

      if (id) {
        url = url + id
      }
      if (addCredentials) {
        user = service.getCurrentUser()
        if (angular.isDefined(user) && angular.isDefined(user.username)) {
          url = url + "?username=" + user.username + "&password=" + user.password  
        }
        
      }
      return  url
    }

    function getUrlForId(userId) {
        return getUrl(path, userId) //+ "?username=" + credentials.username + "&password=" + credentials.password
      }

      /*
      // use instead: service.setCurrentUser and service.getCurrentUser? TODO
      function addCredentials(data) {
        credentials = getCredentials()
        data.username = credentials.username;
        data.password = credentials.password;
        return data;
      }

      function getCredentials() {
        // TODO this is a stub
        if (!service.credentials) {
          var credentials = {}
          service.credentials = credentials
          service.credentials.username = 'gavin' // debug TODO
          service.credentials.password = 'engel'
        }
        
        return service.credentials;
      }

      function setCredentials(user) {
        service.credentials = user
      }
      */
      service.auth = function () {
        //user = store.get('user')
        user = service.getCurrentUser()
        if (angular.isDefined(user) && angular.isDefined(user.username)) {
          result = service.fetchByUsername(user.username)
          .catch(function (res) {
            //store.set('user', {})
            $location.path('login')
          })
        }
        else {
          //store.set('user', {})
          $location.path('login')
        }
      };

      service.fetchAll = function () {
        return $http.get(getUrl(true));
      };

      service.fetch = function (userId) {

        return $http.get(getUrlForId(userId));

      };

      service.fetchByUsername = function (user) {
        //setCredentials(user)
        url = getUrl(true, 'login/'+user.username)
        console.log({'fetchByUsername': url})
        return $http.get(url);

      };

      service.create = function (user) {
        //console.log(489)
        //user = addCredentials(user)
        return $http({
          url: getUrl(),
          method: "POST",
          params: user,
        })
        .success(function (data, status, headers, config) {
          //TODO
          //console.log(497)
        })
        .error(function(data, status, headers, config) {
          //console.log({"ERROR: service.create": [data, status, headers, config]})
        })
      };

      service.update = function (userId, user) {
        var url = getUrl(false, userId)
        url = url + '?username=' + user.username + '&name=' + user.name + '&designation=' + user.designation + '&password=' + user.password
        //console.log({'put url:': url})
        return $http.put(url, user); //TODO figure out why params aren't being sent:
      };

      service.destroy = function (userId) {
        var url = getUrlForId(userId);
        //console.log(url)
        return $http.delete(url);
      };
    })

// LOGIN //////////////////////////////////////////////////////////////////////

expensedivApp.controller('LoginCtrl', function($rootScope, $scope, $location, LoginService, UserService, store){
  var login = this;

  //function signIn(user) {
    $scope.signIn = function(user) {

      console.log({'signin': user})

      UserService.setCurrentUser(user)
      LoginService.login(user).then(function(response) {
        console.log(247)
        //user.access_token = response.data.id;
        //UserService.setCurrentUser(user);
        //$rootScope.$broadcast('authorized');
        //$scope.loggedIn = true
        $scope.currentUser = user
        //console.log('now loggedin with: '+$scope.user.username)
        $location.path('expenses')
      }).catch(function(response) {
        console.log('invalid login')
        
      });
      /*
      LoginService.login(user, function (user) {
        console.log('ahmmmmmm')
        UserService.setCurrentUser(user);
        $rootScope.$broadcast('authorized');
        $location.path('expenses')
      }).then(function(response) {
        console.log(259)
        //$scope.login(user);
      });
*/
    }

  //function register(user) {
    $scope.register = function(user) {

      console.log(254)
      LoginService.register(user)
      .then(function(response) {
        console.log(259)
        $scope.login(user);
      });
    }

  //function submit(user) {
    $scope.submit = function(user) {

      login.newUser ? register(user) : $scope.signIn(user);
    }

    $scope.logout = function() {
      UserService.setCurrentUser() 
      $scope.currentUser = {}
      //store.set('user', {})
      $location.path('login')

    }

    login.newUser = false; //TODO
    //login.currentUser = UserService.getCurrentUser();
    $scope.currentUser = UserService.getCurrentUser()

 })


expensedivApp.service('LoginService', function($http, ENDPOINT_URI, UserService, store) {
  var service = this,
  path = 'Users/';

  function getUrl() {
    return ENDPOINT_URI + path;
  }

  function getLogUrl(action) {
    return getUrl() + action;
  }

  service.login = function(user) {
    return UserService.fetchByUsername(user)
  };

  service.logout = function() {
    console.log(509)
    return $http.post(getLogUrl('logout'));
  };

  service.register = function(user, callback) {
    if (user.newUser) {
      console.log({'register':user})
      // Add new user
      UserService.create(user).then(function (res) {
        // TODO
      })
    }
    callback(user)
  };
})

// HOME ///////////////////////////////////////////////////////////////////////
expensedivApp.controller('HomeCtrl', function($scope, UserService) {
    UserService.auth()
})
/*
expensedivApp.controller('MainCtrl', function ($rootScope, LoginService, UserService) {
  var main = this;

  function logout() {
    console.log(528)
    LoginService.logout()
    .then(function(response) {
      main.currentUser = UserService.setCurrentUser(null);
      $state.go('login');
    }, function(error) {
      //console.log(error);
    });
  }

  $rootScope.$on('authorized', function() {
    main.currentUser = UserService.getCurrentUser();
  });

  $rootScope.$on('unauthorized', function() {
    main.currentUser = UserService.setCurrentUser(null);
    $state.go('login');
  });

  main.logout = logout;
  main.currentUser = UserService.getCurrentUser();
})

expensedivApp.service('APIInterceptor', function($rootScope, UserService) {
  var service = this;

  service.request = function(config) {
    console.log(554)
    var currentUser = UserService.getCurrentUser(),
    access_token = currentUser ? currentUser.access_token : null;

    if (access_token) {
      config.headers.authorization = access_token;
    }
    return config;
  };

  service.responseError = function(response) {
    console.log(565)
    if (response.status === 401) {
      $rootScope.$broadcast('unauthorized');
    }
    return response;
  };
})
*/