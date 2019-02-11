const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


let ContestSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
        unique: true
    },
    duration: {
        type: Number,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    createDate: {
        type: Date
    },
    status: {
        type: Number // 0 pending ,1 ongoing, 2 finished , -1 interrupted
    },
    players: [{
        _id: {
            type: String
        },
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        rank: {
            type: Number
        },
        score: {
            type: Number
        },
        finishDuration: {
            type: Number
        }
    }]
});

let Contest = mongoose.model('Contest', ContestSchema);

module.exports = {Contest}