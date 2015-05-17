angular.module('timezonely', ['ngRoute', 'firebase', 'ui.bootstrap'])

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
            name: 'Co-owner',
            value: "Co-owner"
        }, {
            name: 'PM',
            value: "PM"
        }, {
            name: 'HR',
            value: "HR"
        }, {
            name: 'Developer',
            value: "Developer"
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
.controller('TimezoneCtrl', function($scope, $modal, $location, Timezones, $firebase, fbURL, $routeParams, timezone_table, filterFilter) {
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

    $scope.model = function($scope, $modalInstance, Timezones, id, $firebase, fbURL, timezone_table) {
        $scope.timezone = {};
        $scope.alerts = [];         // array of alert message objects.
        $scope.designations = [{
            name: 'Co-owner',
            value: "Co-owner"
        }, {
            name: 'PM',
            value: "PM"
        }, {
            name: 'HR',
            value: "HR"
        }, {
            name: 'Developer',
            value: "Developer"
        }];
        

        // if clicked edit. id comes from $scope.modal->timezoneId
        if (angular.isDefined(id)) {
            var timezoneUrl = fbURL + timezone_table + '/' + id;
            $scope.timezone = $firebase(new Firebase(timezoneUrl));
            $scope.timezone.id = id;
        } else {
            $scope.timezone.designation = $scope.designations[0].name;
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
})