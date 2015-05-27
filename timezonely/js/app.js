angular.module('timezonely', ['ngRoute', 'firebase', 'ui.bootstrap',  'angular-storage', 'ui.router'])

    .value('fbURL', 'https://timezonely.firebaseio.com/')
    .value('user_table', 'user')
    .value('timezone_table', 'timezone')

    .factory('Users', function($firebase, fbURL, user_table) {
        return $firebase(new Firebase(fbURL + user_table));
    })

    .factory('Timezones', function($firebase, fbURL, timezone_table) {
        return $firebase(new Firebase(fbURL + timezone_table));
    })

    .config(function($routeProvider) {
        $routeProvider
            .when('/home', {
                controller: 'HomeCtrl',
                templateUrl: 'home.html'
            })
            .when('/users', {
                controller: 'UserCtrl',
                templateUrl: 'user.html'
            })
            .when('/timezones', {
                controller: 'TimezoneCtrl',
                templateUrl: 'timezone.html'
            })
            .otherwise({
                redirectTo: '/home'
            });
    })

    .controller('HomeCtrl', function($scope) {
        //
    })
    .controller('UserCtrl', function($scope, $modal, $location, Users, $firebase, fbURL, $routeParams, user_table, filterFilter) {
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
    .controller('TimezoneCtrl', function($scope, $modal, $location, Timezones, $firebase, fbURL, $routeParams, timezone_table, filterFilter, TimezonesModel) {
        // Define valriables
        $scope.alerts = [];     // array of alert message objects.

        $scope.timezones = Timezones;
        
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
/*
        function getTimezones() {
            alert('in getTimezones')
            TimezonesModel.all()
                .then(function (result) {
                    dashboard.timezones = result.data;
                });
        }
*/
        $scope.getTimezones = function() {
            TimezonesModel.all()
                .then(function (result) {
                    dashboard.timezones = result.data;
                });
        };

/*
        function createTimezone(timezone) {
alert('in createTimezones')
            TimezonesModel.create(timezone)
                .then(function (result) {
                    initCreateForm();
                    getTimezones();
                });
        }
*/
        $scope.createTimezone = function(timezone) {
alert('in createTimezones')
alert(timezone)
            TimezonesModel.create(timezone)
                .then(function (result) {
                    initCreateForm();
                    getTimezones();
                });
        };


        function updateTimezone(timezone) {
            alert('in updateTimezones')
            TimezonesModel.update(timezone.id, timezone)
                .then(function (result) {
                    cancelEditing();
                    getTimezones();
                });
        }

        function deleteTimezone(timezoneId) {
            alert('in deleteTimezone')
            TimezonesModel.destroy(timezoneId)
                .then(function (result) {
                    cancelEditing();
                    getTimezones();
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

//
    })
    // new://////////////////////////////////////////////////////////////////////////////////////////////////////////
    //angular.module('SimpleRESTWebsite', ['angular-storage', 'ui.router', 'weblogng'])
    //.constant('ENDPOINT_URI', 'http://ovh.engeldev.com:1337/api/') // this is the simple api
    .constant('ENDPOINT_URI', 'http://ovh.engeldev.com:9000/api/') // this is the timezones api
    .constant('ENDPOINT_PARAMS', '?username=gavin&password=engel') // debug to login api

   
    .service('APIInterceptor', function($rootScope, UserService) {
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
    .service('UserService', function(store) {
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
    .service('LoginService', function($http, ENDPOINT_URI) {
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
    .service('ItemsModel', function ($http, ENDPOINT_URI) {
        var service = this,
            path = 'items/';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };
    })

    .service('TimezonesModel', function ($http, ENDPOINT_URI) {
        var service = this,
            path = 'timezones/';

        function getUrl() {
            return ENDPOINT_URI + path;
        }

        function getUrlForId(timezoneId) {
            return getUrl(path) + timezoneId + ENDPOINT_PARAMS;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (timezoneId) {
            return $http.get(getUrlForId(timezoneId));
        };

        service.create = function (timezone) {
            alert('service.create')
            return $http.post(getUrl(), timezone);
        };

        service.update = function (timezoneId, timezone) {
            return $http.put(getUrlForId(timezoneId), timezone);
        };

        service.destroy = function (timezoneId) {
            return $http.delete(getUrlForId(timezoneId));
        };
    })
    .controller('LoginCtrl', function($rootScope, $state, LoginService, UserService){
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
    .controller('MainCtrl', function ($rootScope, $state, LoginService, UserService) {
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
;

//

function TimeCtrl($scope, $timeout) {
    $scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000 //ms

    var tick = function () {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);
}