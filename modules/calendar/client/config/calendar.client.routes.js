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
        url: '/calendar',
        template: '<ui-view/>'
      })
      .state('calendar.detail', {
          'url': '/detail',
          templateUrl: '/modules/calendar/client/views/detail.client.view.html',
          controller: 'CalendarDetailController',
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
