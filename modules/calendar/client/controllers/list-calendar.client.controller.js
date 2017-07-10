(function () {
  'use strict';

  angular
    .module('calendar')
    .controller('CalendarListController', CalendarListController);

  CalendarListController.$inject = ['CalendarService'];

  function CalendarListController(CalendarService) {
    var vm = this;

    vm.calendar = CalendarService.query();
  }
}());
