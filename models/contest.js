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
        type: Date
    },
    createDate: {
        type: Date
    },
    status: {
        type: Number
    },
    participant: [{
        id: {
            type: String
        },
        rank: {
            type: Number
        },
        finishDuration: {
            type: Number
        }
    }]
});

let Contest = mongoose.model('Contest', ContestSchema);

module.exports = {Contest}