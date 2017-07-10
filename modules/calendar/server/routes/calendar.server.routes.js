'use strict';

/**
 * Module dependencies
 */
var calendarPolicy = require('../policies/calendar.server.policy'),
  calendar = require('../controllers/calendar.server.controller');

module.exports = function (app) {
  // Calendar collection routes
  app.route('/api/calendar').all(calendarPolicy.isAllowed)
    .get(calendar.list)
    .post(calendar.create);

  // Single calendar routes
  app.route('/api/calendar/:itemId').all(calendarPolicy.isAllowed)
    .get(calendar.read)
    .put(calendar.update)
    .delete(calendar.delete);

  // Finish by binding the calendar middleware
  app.param('itemId', calendar.itemByID);
};
