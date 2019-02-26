const mongoose = require('mongoose');
const validator = require('validator');


let ContestSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    pieces: {
        type: Number,
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
    unfinished: {
        type: Number
    },
    unfinishedCount: {
        type: Number
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
        percent: {
            type: Number
        },
        finishDuration: {
            type: Number
        }
    }]
});

let Contest = mongoose.model('Contest', ContestSchema);

module.exports = {Contest}