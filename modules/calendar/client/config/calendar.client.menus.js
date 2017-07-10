(function () {
  'use strict';

  angular
    .module('calendar')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Calendar',
      state: 'calendar',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'calendar', {
      title: 'Calendar',
      state: 'calendar.detail',
      roles: ['*']
    });
  }
}());
