(function (app) {
  'use strict';

  app.registerModule('calendar', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  // app.registerModule('calendar.admin', ['core.admin']);
  // app.registerModule('calendar.admin.routes', ['core.admin.routes']);
  app.registerModule('calendar.services');
  app.registerModule('calendar.routes', ['ui.router', 'core.routes', 'calendar.services']);
}(ApplicationConfiguration));
