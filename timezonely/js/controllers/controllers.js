// TODO remove mentions of dashboard
// TODO remove all firebase stuff
// TIMEZONES //////////////////////////////////////////////////////////////////

timezonelyApp.controller('TimezoneCtrl', function(envoy, $scope, $modal, $location, $routeParams, timezone_table, filterFilter, TimezonesService) {
    // Define variables
    envoy.TimezoneCtrl = true;

    $scope.alerts = [];     // array of alert message objects.

    // Remove timezone
    $scope.removeRecord = function(timezoneId) {
      $scope.alerts.splice(0, 1);
      $scope.alerts.push({
        type: 'success',
        msg: "timezone removed successfully!"
      });

      TimezonesService.destroy(timezoneId)
      .then(function (result) {
        cancelEditing();
        $scope.getTimezones();
      });
    };

    // Close alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    // Modal: called by edit(timezoneId) and Add new timezone
    $scope.open = function(timezoneId) {
      var modalInstance = $modal.open({
        templateUrl: 'add_timezone_modal',
        controller: $scope.model,
        resolve: {
          id: function() {
            return timezoneId;
          }
        }
      });
    };

    $scope.getLocalTime = function(timezone) {

    };

    var dashboard = this;

    $scope.getTimezones = function() {
      TimezonesService.fetchAll()
      .then(function (result) {
            dashboard.timezones = result.data;//debug
            envoy.timezones = result.data;
          });
    };

    $scope.createTimezone = function(timezone) {
      TimezonesService.create(timezone)
      .then(function (result) {
            //initCreateForm();
            $scope.getTimezones();
            $modalInstance.dismiss('cancel');

          });
    };

    function updateTimezone(timezone) {
      alert('in updateTimezones')
      TimezonesService.update(timezone.id, timezone)
      .then(function (result) {
        cancelEditing();
        $scope.getTimezones();
      });
    }

    function deleteTimezone(timezoneId) {
      alert('in deleteTimezone')
      TimezonesService.destroy(timezoneId)
      .then(function (result) {
        cancelEditing();
        $scope.getTimezones();
      });
    }

    //function initCreateForm() {
    //    dashboard.newTimezone = { name: '', description: '' };
    //}

    function setEditedTimezone(timezone) {
      dashboard.editedTimezone = angular.copy(timezone);
      dashboard.isEditing = true;
    }

    function isCurrentTimezone(timezoneId) {
      return dashboard.editedTimezone !== null && dashboard.editedTimezone.id === timezoneId;
    }

    function cancelEditing() {
      dashboard.editedTimezone = null;
      dashboard.isEditing = false;
    }

    dashboard.timezones = [];
    dashboard.editedTimezone = null;
    dashboard.isEditing = false;
    dashboard.getTimezones = $scope.getTimezones;
    dashboard.createTimezone = $scope.createTimezone;
    dashboard.updateTimezone = updateTimezone;
    dashboard.deleteTimezone = deleteTimezone;
    dashboard.setEditedTimezone = setEditedTimezone;
    dashboard.isCurrentTimezone = isCurrentTimezone;
    dashboard.cancelEditing = cancelEditing;


    $scope.model = function(envoy, $scope, $modalInstance, id, timezone_table) {
      envoy.model = true;
      $scope.timezone = {};
      $scope.alerts = []; // array of alert message objects.

      if (angular.isDefined(id)) {
        TimezonesService.fetch(id)
        .then(function (res) {
          $scope.timezone = res.data[0];
        });
      }


      // close modal
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      // Add new timezone
      $scope.add = function() {
        TimezonesService.create($scope.timezone)
        .then(function (result) {

          TimezonesService.fetchAll()
          .then(function (result) {
            envoy.timezones = result.data;
          });


          //initCreateForm();
          $modalInstance.dismiss('cancel');

        })

      }

      // Save edited timezone.
      $scope.save = function() {
        TimezonesService.update($scope.timezone._id, $scope.timezone)
        .then(function (res) {
          TimezonesService.fetchAll()
          .then(function (result) {
            envoy.timezones = result.data;
          });
          //initCreateForm();
          $modalInstance.dismiss('cancel');
        })
      };
    };
    
    // controller final
    //initCreateForm();
    $scope.getTimezones();
    $scope.envoy = envoy //TODO
  })


timezonelyApp.service('TimezonesService', function($http, ENDPOINT_URI, envoy) {
  var service = this,
  path = 'timezones/';

  function getUrl(addCredentials, id) {
    var url = ENDPOINT_URI + path

    if (id) {
      url = url + id
    }
    if (addCredentials) {
      credentials = getCredentials()
      url = url + "?username=" + credentials.username + "&password=" + credentials.password
    }
    return  url
  }

  function getUrlForId(timezoneId) {
        return getUrl(path, timezoneId) //+ "?username=" + credentials.username + "&password=" + credentials.password
      }

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


      service.fetchAll = function () {
        return $http.get(getUrl(true));
      };

      service.fetch = function (timezoneId) {

        return $http.get(getUrlForId(timezoneId));

      };

      service.create = function (timezone) {
        timezone = addCredentials(timezone)
        return $http({
          url: getUrl(),
          method: "POST",
          params: timezone,
        }).success(function (data, status, headers, config) {
            //TODO
          })
      };

      service.update = function (timezoneId, timezone) {
        var url = getUrlForId(timezoneId);
        url = url + '&city=' + timezone.city + '&designation=' + timezone.designation + '&difference=' + timezone.difference + '&zonename=' + timezone.zonename
        return $http.put(url, timezone); //TODO figure out why params aren't being sent:
      };

      service.destroy = function (timezoneId) {
        var url = getUrlForId(timezoneId);
        return $http.delete(url);
      };
    })

// USERS //////////////////////////////////////////////////////////////////////


timezonelyApp.controller('LoginCtrl', function($rootScope, $state, LoginService, UserService){
  var login = this;

  function signIn(user) {
    LoginService.login(user)
    .then(function(response) {
      user.access_token = response.data.id;
      UserService.setCurrentUser(user);
      $rootScope.$broadcast('authorized');
      $state.go('dashboard');
    });
  }

  function register(user) {
    LoginService.register(user)
    .then(function(response) {
      login(user);
    });
  }

  function submit(user) {
    login.newUser ? register(user) : signIn(user);
  }

  login.newUser = false;
  login.submit = submit;
})

timezonelyApp.controller('UserCtrl', function($scope, $modal, $location, envoy, $routeParams, user_table, filterFilter, UserService) {
    // Define valriables
    $scope.alerts = [];     // array of alert message objects.
    var dashboard = this;

    // Remove user
    $scope.removeRecord = function(userId) {
      $scope.alerts.splice(0, 1);
      $scope.alerts.push({
        type: 'success',
        msg: "user removed successfully!"
      });

      console.log(userId+'is userid in removerecord')

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
      console.log(306+' '+userId)
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
      console.log('setting envoy.'+key+' to:')
      console.log(val)
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
            console.log({'editing user' : $scope.user})
          });
        }

        // close modal
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };

      // Add new user
      $scope.add = function() {
        console.log(364)
        UserService.create($scope.user)
        .then(function (result) {
          console.log(366)
          UserService.fetchAll()
          .then(function (result) {
            console.log(369)
            envoy.users = result.data;
            //$scope.setEnvoy('users', result.data)
            $modalInstance.dismiss('cancel');
            console.log(373)
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
      dashboard.editedTimezone = null;
      dashboard.isEditing = false;
    }


    // controller final
    $scope.getUsers()
        $scope.envoy = envoy //TODO

  })


timezonelyApp.service('UserService', function($http, ENDPOINT_URI, envoy, store) {
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
        credentials = getCredentials()
        url = url + "?username=" + credentials.username + "&password=" + credentials.password
      }
      return  url
    }

    function getUrlForId(userId) {
        return getUrl(path, userId) //+ "?username=" + credentials.username + "&password=" + credentials.password
      }

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


      service.fetchAll = function () {
        return $http.get(getUrl(true));
      };

      service.fetch = function (userId) {

        return $http.get(getUrlForId(userId));

      };

      service.create = function (user) {
        console.log(489)
        //user = addCredentials(user)
        return $http({
          url: getUrl(),
          method: "POST",
          params: user,
        })
        .success(function (data, status, headers, config) {
          //TODO
          console.log(497)
        })
        .error(function(data, status, headers, config) {
          console.log({"ERROR: service.create": [data, status, headers, config]})
        })
      };

      service.update = function (userId, user) {
        var url = getUrl(false, userId)
        url = url + '?username=' + user.username + '&name=' + user.name + '&designation=' + user.designation + '&password=' + user.password
        console.log({'put url:': url})
        return $http.put(url, user); //TODO figure out why params aren't being sent:
      };

      service.destroy = function (userId) {
        var url = getUrlForId(userId);
        console.log(url)
        return $http.delete(url);
      };
    })

timezonelyApp.service('LoginService', function($http, ENDPOINT_URI) {
  var service = this,
  path = 'Users/';

  function getUrl() {
    return ENDPOINT_URI + path;
  }

  function getLogUrl(action) {
    return getUrl() + action;
  }

  service.login = function(credentials) {
    return $http.post(getLogUrl('login'), credentials);
  };

  service.logout = function() {
    return $http.post(getLogUrl('logout'));
  };

  service.register = function(user) {
    return $http.post(getUrl(), user);
  };
})

// HOME ///////////////////////////////////////////////////////////////////////
timezonelyApp.controller('HomeCtrl', function($scope) {
//
})


timezonelyApp.controller('MainCtrl', function ($rootScope, $state, LoginService, UserService) {
  var main = this;

  function logout() {
    LoginService.logout()
    .then(function(response) {
      main.currentUser = UserService.setCurrentUser(null);
      $state.go('login');
    }, function(error) {
      console.log(error);
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

timezonelyApp.service('APIInterceptor', function($rootScope, UserService) {
  var service = this;

  service.request = function(config) {
    var currentUser = UserService.getCurrentUser(),
    access_token = currentUser ? currentUser.access_token : null;

    if (access_token) {
      config.headers.authorization = access_token;
    }
    return config;
  };

  service.responseError = function(response) {
    if (response.status === 401) {
      $rootScope.$broadcast('unauthorized');
    }
    return response;
  };
})
