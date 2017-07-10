(function () {
  'use strict';

  angular
    .module('calendar.services')
    .factory('CalendarService', CalendarService);

  CalendarService.$inject = ['$resource', '$log'];

  function CalendarService($resource, $log) {
    var Calendar = $resource('/api/calendar/:itemId', {
      itemId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Calendar.prototype, {
      createOrUpdate: function () {
        var calendar = this;
        return createOrUpdate(calendar);
      }
    });


    function createOrUpdate(calendar) {
      if (calendar._id) {
        return calendar.$update(onSuccess, onError);
      } else {
        return calendar.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(calendar) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }

    return Calendar;
  }
}());
