// TIMEZONES //////////////////////////////////////////////////////////////////

timezonelyApp.controller('TimezoneCtrl', function($scope, $modal, $location, Timezones, $firebase, fbURL, $routeParams, timezone_table, filterFilter, TimezonesService) {
    // Define valriables
    $scope.alerts = [];     // array of alert message objects.
    $scope.viewData = {}
    $scope.timezones = Timezones;

$scope.viewData.test = '123'
    // Remove timezone
    $scope.removeRecord = function(timezoneId) {
        var timezoneUrl = fbURL + timezone_table + '/' + timezoneId;
        $scope.timezone = $firebase(new Firebase(timezoneUrl));
        $scope.timezone.$remove()
        $scope.alerts.splice(0, 1);
        $scope.alerts.push({
            type: 'success',
            msg: "timezone removed successfully!"
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
    //return 'timezone id is:'+timezone.$id;

    };

    $scope.model = function($scope, $modalInstance, Timezones, id, $firebase, fbURL, timezone_table) {
        $scope.timezone = {};
    $scope.alerts = [];         // array of alert message objects.

    // if clicked edit. id comes from $scope.modal->timezoneId
    if (angular.isDefined(id)) {
        var timezoneUrl = fbURL + timezone_table + '/' + id;
        $scope.timezone = $firebase(new Firebase(timezoneUrl));
        $scope.timezone.id = id;
    } 

    // close modal
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // Add new timezone
    $scope.add = function() {
        Timezones.$add($scope.timezone)
        $modalInstance.dismiss('cancel');
    };

    // Save edited timezone.
    $scope.save = function() {
        $scope.timezone.$save();
        $modalInstance.dismiss('cancel');
    };
    };
    //

    /// new: 
    var dashboard = this;

    $scope.getTimezones = function() {
      console.log('in getTimezones')
        TimezonesService.fetchAll()//.all()
        .then(function (result) {
            dashboard.timezones = result.data;
            console.log(dashboard.timezones)
        });
    };


    $scope.createTimezone = function(timezone) {
        TimezonesService.create(timezone)
        .then(function (result) {
            initCreateForm();
            $scope.getTimezones();
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

    function initCreateForm() {
        dashboard.newTimezone = { name: '', description: '' };
    }

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

    initCreateForm();
    $scope.getTimezones();
    // fill 'timezones' for view
    //$scope.viewData.timezones = $scope.getTimezones()
    console.log('timezones:')
    console.log($scope.viewData.timezones)
    //
})


timezonelyApp.service('TimezonesService', function($http, ENDPOINT_URI) {
    var service = this,
        path = 'timezones/';

    function getUrl(addCredentials) {
        var url = ENDPOINT_URI + path
        if (addCredentials) {
          credentials = getCredentials()
          url = url + "?username=" + credentials.username + "&password=" + credentials.password
        }
        return  url
    }

    function getUrlForId(timezoneId) {
        credentials = getCredentials()
        return getUrl(path) + timezoneId //+ "?username=" + credentials.username + "&password=" + credentials.password
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

    service.all = function () {
      console.log('inside all')
      var url = getUrl();
      console.log(url)
      //var result = $http.get(url);
/*
        return $http({
            url: url,
            method: "GET"
        }).success(function (data, status, headers, config) {
            console.log(data);
        })
*/

$http.get(url)
    .success(function (data, status, headers, config) {
      alert('success')
        console.log(data);
        return data;
    }).error(function (data, status, headers, config) {
        alert("error");
        return status;
});

$http.get('/someUrl')
  .success(function(data, status, headers, config) {
    // this callback will be called asynchronously
    // when the response is available
    console.log('aaaaaaaaaaa')
  })
  .error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    console.log('bbbbbbbbbbb')
  });

      var result =  $http.get(url)
        .success(function(data, status, headers, config) {
          console.log('success in 202')
          console.log(data)
          $scope.viewData.timezones = data.records;
        })
        .error(function(data, status, headers, config) {
          console.log('error in 206')
          console.log(data)

          // called asynchronously if an error occurs
          // or server returns response with an error status.
        })


      console.log('result is:')
      console.log(result)
      console.log('end result')
      return result;
    };


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
            console.log(data);
        })
    };

    service.update = function (timezoneId, timezone) {
        return $http.put(getUrlForId(timezoneId), timezone);
    };

    service.destroy = function (timezoneId) {
        return $http.delete(getUrlForId(timezoneId));
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

timezonelyApp.controller('UserCtrl', function($scope, $modal, $location, Users, $firebase, fbURL, $routeParams, user_table, filterFilter) {
    // Define valriables
    $scope.alerts = [];     // array of alert message objects.

    $scope.users = Users;

    // Remove user
    $scope.removeRecord = function(userId) {
        var userUrl = fbURL + user_table + '/' + userId;
        $scope.user = $firebase(new Firebase(userUrl));
        $scope.user.$remove()
        $scope.alerts.splice(0, 1);
        $scope.alerts.push({
            type: 'success',
            msg: "User removed successfully!"
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

    $scope.model = function($scope, $modalInstance, Users, id, $firebase, fbURL, user_table) {
        $scope.user = {};
    $scope.alerts = [];         // array of alert message objects.
    $scope.designations = [{
        name: 'Regular',
        value: "Regular"
    }, {
        name: 'Manager',
        value: "Manager"
    }];


    // if clicked edit. id comes from $scope.modal->userId
    if (angular.isDefined(id)) {
        var userUrl = fbURL + user_table + '/' + id;
        $scope.user = $firebase(new Firebase(userUrl));
        $scope.user.id = id;
    } else {
        $scope.user.designation = $scope.designations[0].name;
    }

    // close modal
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // Add new user
    $scope.add = function() {
        Users.$add($scope.user)
        $modalInstance.dismiss('cancel');
    };

    // Save edited user.
    $scope.save = function() {
        $scope.user.$save();
        $modalInstance.dismiss('cancel');
    };
    };
})


timezonelyApp.service('UserService', function(store) {
    var service = this,
        currentUser = null;

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
