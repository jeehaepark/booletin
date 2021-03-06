angular.module('booletin.events', [])

.controller('EventController', function($scope, Events, $state, $firebaseArray, $stateParams) {
  var dbConnection = new Firebase("https://booletin.firebaseio.com/events");

  if ($stateParams.search === "no") {
    $scope.events = $firebaseArray(dbConnection);
    Events.targetZipsString = "all";
  } else {
    $scope.events = Events.events;
  }
  $scope.targetZipsString = Events.targetZipsString;
  if ($scope.targetZipsString === "") {
    Events.targetZipsString = "all";
  }
  $scope.targetZipsString = Events.targetZipsString;
  $scope.queryZip = {};

  $scope.validZip = false;
  $scope.getEvents = function() {
    Events.queryLocation($scope.queryZip)
      .then(function(response) {
        $scope.invalidZip = false;
        Events.targetZips = [];
        Events.targetZipsString = "";
        Events.lastLookup = $scope.queryZip.zipcode;
        for (var i = 0; i < response.data[0].zip_codes.length; i++) {
          Events.targetZips.push(response.data[0].zip_codes[i].zip_code);
          Events.targetZipsString += (response.data[0].zip_codes[i].zip_code + ", ");
        }
        Events.targetZipsString = Events.targetZipsString.slice(0, Events.targetZipsString.length - 2);
      })
      .then(function() {
        //query db for all zip codes
        $scope.loading = true;
        Events.events = [];

        for (var j = 0; j < Events.targetZips.length; j++) {
          dbConnection.orderByChild('zipCode').equalTo(Events.targetZips[j]).on('value', function(snap) {
            var dbRes = snap.val();

            if (dbRes !== null) {
              for (var key in dbRes) {

                Events.events.push(dbRes[key]);
              }
            }
          }, function(errObj) {

          });
        }

      })
      .then(function() {
        // navigate to events view
        setTimeout(function() {

          $state.go('events');
        }, 2000);
      })
      .catch(function(error) {
        $scope.invalidZip = true;
      });
  };

});
