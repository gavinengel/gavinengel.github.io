// TIMEZONES //////////////////////////////////////////////////////////////////

timezonelyApp.controller('TimezoneCtrl', function(envoy, $scope, $modal, $location, Timezones, $firebase, fbURL, $routeParams, timezone_table, filterFilter, TimezonesService) {
    // Define valriables
    envoy.TimezoneCtrl = true;
    console.log(envoy)

    $scope.alerts = [];     // array of alert message objects.
    $scope.timezones = Timezones;
    //if (typeof envoy === 'undefined') { envoy = { valid: true } }

    // Remove timezone
    $scope.removeRecord = function(timezoneId) {
        //var timezoneUrl = fbURL + timezone_table + '/' + timezoneId;
        //$scope.timezone = $firebase(new Firebase(timezoneUrl));
        //$scope.timezone.$remove()
        $scope.alerts.splice(0, 1);
        $scope.alerts.push({
            type: 'success',
            msg: "timezone removed successfully!"
        });
        //

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
    //return 'timezone id is:'+timezone.$id;

    };


    /// new: 
    var dashboard = this;

    $scope.getTimezones = function() {
      console.log('in getTimezones')
        TimezonesService.fetchAll()//.all()
        .then(function (result) {
            console.log('then...')
            dashboard.timezones = result.data;//debug
            envoy.timezones = result.data;
            console.log('here be envoy:')
            console.log(envoy.timezones)
        });
    };


    $scope.createTimezone = function(timezone) {
      console.log('lets do it and create timezone')
        TimezonesService.create(timezone)
        .then(function (result) {
            initCreateForm();
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
    //console.log('timezones:')
    //console.log($scope.dashboard.timezones)
    //envoy.timezones = $scope.getTimezones()
    envoy.test = 2;
    console.log('envoy:')
    console.log(envoy)
    console.log('155')
    //

    $scope.model = function(envoy, $scope, $modalInstance, Timezones, id, $firebase, fbURL, timezone_table) {
      envoy.model = true;
      console.log(envoy)
      console.log(45)
      $scope.timezone = {};
      $scope.alerts = []; // array of alert message objects.

      if (angular.isDefined(id)) {
        console.log('here be the id!!'+id)
 
        TimezonesService.fetch(id)//.all()
        .then(function (res) {
            console.log('then...')
            $scope.timezone = res.data[0];
            console.log('here be envoy.timezone:')
            console.log(envoy.timezone)
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


          initCreateForm();
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
            console.log('reloaded with this:')
            console.log(envoy.timezones)
          });


          initCreateForm();
          $modalInstance.dismiss('cancel');

        })


      };
    };
    
    $scope.envoy = envoy
})


timezonelyApp.service('TimezonesService', function($http, ENDPOINT_URI, envoy) {
    var service = this,
        path = 'timezones/';

    function getUrl(addCredentials, id) {console.log(68)
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

    function getUrlForId(timezoneId) {console.log(68)
        return getUrl(path, timezoneId) //+ "?username=" + credentials.username + "&password=" + credentials.password
    }

    function addCredentials(data) {console.log(68)
        credentials = getCredentials()
        data.username = credentials.username;
        data.password = credentials.password;
        return data;
    }

   function getCredentials() {console.log(68)
        // TODO this is a stub
        var credentials = {}
        credentials.username = 'gavin';
        credentials.password = 'engel';
        return credentials;
    }


    service.fetchAll = function () {console.log(68)
        return $http.get(getUrl(true));
    };

    service.fetch = function (timezoneId) {console.log(68)

        return $http.get(getUrlForId(timezoneId));

    };

    service.create = function (timezone) {console.log(68)
        timezone = addCredentials(timezone)
        return $http({
            url: getUrl(),
            method: "POST",
            params: timezone,
        }).success(function (data, status, headers, config) {
            console.log(data);
        })
    };

    service.update = function (timezoneId, timezone) {console.log(68)
        var url = getUrlForId(timezoneId);
        url = url + '&city=' + timezone.city + '&designation=' + timezone.designation + '&difference=' + timezone.difference + '&zonename=' + timezone.zonename
        console.log('sending this shit:')
        console.log(timezone)
        console.log(url)
        return $http.put(url, timezone); //TODO figure out why params aren't being sent:
    };

    service.destroy = function (timezoneId) {console.log('in destroy... id is:'+timezoneId)
        var url = getUrlForId(timezoneId);
        console.log('destroy url is:'+url+'[end]')
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
