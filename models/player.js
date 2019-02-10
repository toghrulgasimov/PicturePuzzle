const mongoose = require('mongoose');
const validator = require('validator');


let PuzzePlayerSchema = new mongoose.Schema({
    mission: {
        type: Number,
        required: true
    },
    score:{
        type: Number,
        required: true
    },
    _id: {
        type: String,
        required: true
    }
});

let PuzzlePlayer = mongoose.model('PuzzlePlayer', PuzzePlayerSchema);

module.exports = {PuzzlePlayer}