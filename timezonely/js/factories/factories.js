timezonelyApp.factory('Users', function($firebase, fbURL, user_table) {
  return $firebase(new Firebase(fbURL + user_table));
})
/*
timezonelyApp.factory('Timezones', function($firebase, fbURL, timezone_table) {
  return $firebase(new Firebase(fbURL + timezone_table));
})
*/