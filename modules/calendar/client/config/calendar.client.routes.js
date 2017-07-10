(function () {
  'use strict';

  angular
    .module('calendar.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('calendar', {
        abstract: true,
        url: '/',
        template: '<ui-view/>'
      })
      .state('calendar.view', {
          'url': '',
          templateUrl: '/modules/calendar/client/views/calendar.client.view.html',
          controller: 'CalendarController',
          controllerAs:'vm',
          resolve: {
            calendarResolve: newCalendarItem,
          },
      });
  }

  newCalendarItem.$inject = ['CalendarService'];

  function newCalendarItem(CalendarService) {
    return new CalendarService();
  }
}());
