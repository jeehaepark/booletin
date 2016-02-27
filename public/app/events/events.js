angular.module('booletin.events', [])

.controller('EventController', function($scope, Events, $state, $firebaseArray, $stateParams) {
  var dbConnection = new Firebase("https://glowing-torch-8522.firebaseio.com");//https://booletin.firebaseio.com/events

  if ($stateParams.search === "no") {
    $scope.events = $firebaseArray(dbConnection);
    Events.targetZipsString = "all";
  } else {
    $scope.events = Events.events;
  }
  //filter function to only display events that haven't happened
  $scope.newEventsOnly = function(event) {
    var today = new Date();
    return new Date(event.startDate) > today;
  };
  //determines whether future or past events are shown
  $scope.dateSort = $scope.newEventsOnly;
  //displays events that have already passed
  $scope.showEvents = function(timing) {
    if (timing === 'past') {
      $scope.dateSort = function(event) {
        return new Date(event.startDate) < new Date();
      };
    } else {
      $scope.dateSort = $scope.newEventsOnly;
    }
  };

  $scope.targetZipsString = Events.targetZipsString;
  if ($scope.targetZipsString === "") {
    Events.targetZipsString = "all";
  }
  $scope.targetZipsString = Events.targetZipsString;
  $scope.queryZip = {};

  $scope.validZip = false;
  $scope.getEvents = function() {
    //console.log(window.fbAsyncInit)
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
  $scope.initFB = function (){
    window.fbAsyncInit();  
  };

  $scope.addGoogle = function(eventName, startDate, eventDescription){
    // eventName = ;

    var formatDate = function(unformattedDate){
      var d = new Date(unformattedDate);
      var month = '' + (d.getMonth() + 1);
      var date = '' + d.getDate();
      var year = d.getFullYear();

      if(month.length < 2){
        month = '0' + month;
      }

      if(date.length < 2){
        date = '0' + date;
      }

      return year + month + date;
    };

    var formattedDate = formatDate(startDate);

    console.log('this is eventname & startDate', eventName, formattedDate, eventDescription);
    var href = "http://www.google.com/calendar/event?action=TEMPLATE&amp;text=" + "" + "&amp;dates=20110206T190000Z/20110206T200000Z&amp;details=Fake%20event%20for%20testing.%0A%0AFor%20details%2C%20visit%20http%3A%2F%2Fendzonerealty.com%2Fblog%2F2011%2Fcreate-an-add-to-google-calendar-button-for-a-single-event-eventbrite-facebook-too%2F&amp;location=&amp;trp=false&amp;sprop=http%3A%2F%2Fendzonerealty.com%2F&amp;sprop=name:EndZoneRealty.com ";

  };
  
});
