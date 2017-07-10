'use strict';

/**
 * Module dependencies
 */
var path = require('path')
    , mongoose = require('mongoose')
    , Calendar = mongoose.model('Calendar')
    , errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'))

/**
 * Create a calendar
 */
exports.create = function (req, res) {
  var calendar = new Calendar(req.body);
  calendar.user = req.user;
  calendar.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(calendar);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var calendar = req.calendar ? req.calendar.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  // calendar.isCurrentUserOwner = !!(req.user && calendar.user && calendar.user._id.toString() === req.user._id.toString());

  res.json(calendar);
};

/**
 * Update an article
 */
exports.update = function (req, res) {
  var calendar = req.calendar;

  calendar.title = req.body.title;
  calendar.description = req.body.description;
  calendar.startedAt = req.body.startedAt || calendar.startedAt;
  calendar.finishedAt = req.body.finishedAt || calendar.finishedAt;
  calendar.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(calendar);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var calendar = req.calendar;

  calendar.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(calendar);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  let $query = {}
  if (typeof req.query.range !== 'undefined') {
      let params = req.query.range.split(',')
      if (typeof params[0] !== 'undefined') {
          $query.startedAt = { $gte: params[0] }
      }
      if (typeof params[1] !== 'undefined') {
          $query.finishedAt = { $lte: params[1] }
      }
  }
  Calendar.find($query).sort('-created').populate('user', 'displayName').exec(function (err, calendarItems) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(calendarItems);
    }
  });
};

/**
 * Article middleware
 */
exports.itemByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Calendar.findById(id).populate('user', 'displayName').exec(function (err, calendar) {
    if (err) {
      return next(err);
  } else if (!calendar) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.calendar = calendar;
    next();
  });
};
