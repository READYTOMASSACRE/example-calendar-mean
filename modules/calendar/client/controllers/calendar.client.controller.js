(function () {
  'use strict';

  angular
    .module('calendar')
    .controller('CalendarController', CalendarController);

  CalendarController.$inject = ['$scope', 'calendarResolve', 'Authentication'];

  function CalendarController($scope, calendar, Authentication) {
    var vm = this;

    vm.calendar = calendar;
    vm.authentication = Authentication;

  }
}());
