'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['guest', 'user'],
    allows: [
        {
            resources: '/api/calendar',
            permissions: ['get', 'post', 'put']
        },
        {
            resources: '/api/calendar/:itemId',
            permissions: ['get']
        },
    ]
  }]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an article is being processed and the current user created it then allow any manipulation
  if (req.calendar && (
      (req.calendar.user && req.user && req.calendar.user.id === req.user.id)
      || (!req.calendar.user)
    )
  ) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(422).json({
          message: 'Доступ запрещен, это не ваша бронь'
        });
      }
    }
  });
};
