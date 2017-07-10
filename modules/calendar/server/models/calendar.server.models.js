'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose')
    , Schema = mongoose.Schema

/**
 * Calendar Schema
 */

var CalendarSchema = null

/**
 * Валидатор на уникальные записи
 */
var validatorUniqueLine = function (startedAt, result) {
    if (this.isModified('startedAt') || this.isModified('finishedAt')) {
        let Calendar = mongoose.model('Calendar', CalendarSchema)
        Calendar.validateLines(this, this.isNew ? false: this._id, function(err, lines) {
            result(!lines.length)
        })
    } else {
        result(true)
    }
}

/**
 * Описание модели
 */
CalendarSchema = new Schema({
    createdAt: {
        type: Date
        , default: Date.now
    }
    , title: {
        type: String
        , default: ''
        , trim: true
        , required: 'Title cannot be blank'
    }
    , description: {
        type: String
        , default: ''
        , trim: true
    }
    , startedAt: {
        type: Date
        , default: Date.Now
        , required: 'Started At cannot be blank'
        , validate: {
            isAsync: true
            , validator: validatorUniqueLine
            , message: 'Такая бронь уже существует'
        }
    }
    , finishedAt: {
        type: Date
        , default: Date.Now
        , required: 'Finsihed At cannot be blank'
    }
    , user: {
        type: Schema.ObjectId
        , ref: 'User'
    },
});

/**
 * Запрос, с помощью которого пытаемся найти пересечение записей
 */
CalendarSchema.statics.validateLines = function(lines, id, cb) {
    var $query = null
    if (
        lines
        && typeof lines.startedAt !== 'undefined'
        && typeof lines.finishedAt !== 'undefined'
    ) {
        $query = {
            $or: [
                {
                    startedAt: { $lte: lines.startedAt }
                    , finishedAt: { $gte: lines.finishedAt }
                },
                {
                    startedAt: { $gte: lines.startedAt }
                    , finishedAt: { $lte: lines.finishedAt }
                },
                {
                    $and: [
                        { startedAt: { $gte: lines.startedAt } }
                        , { startedAt: { $lte: lines.finishedAt } }
                    ] , finishedAt: { $gte: lines.finishedAt }
                },
                {
                    $and: [
                        { finishedAt: { $gte: lines.startedAt } }
                        , { finishedAt: { $lte: lines.finishedAt } }
                    ] , startedAt: { $lte: lines.startedAt }
                },
            ]
        }
        if (id) {
            $query._id = {
                $not: { $eq: id }
            }
        }
    }

    return ($query && this.model('Calendar').find($query, cb)) || false
}

/**
 * регистрируем модель
 */
mongoose.model('Calendar', CalendarSchema)
