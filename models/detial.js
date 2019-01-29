const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var subSchema = mongoose.Schema({
    id: String
}, {_id: false});
let ConversationSchema = new mongoose.Schema({
    messages: [{
        createDate: {
            type: Date
        },
        senderId: {
            type: String
        },
        receiverId: {
            type: String
        },
        receiverName: {
            type: String
        },
        senderName: {
            type: String
        },
        message: {
            type: String
        },

    }],
    members: [subSchema],
    room: {
        type: String,
        unique: true,
    }

});


let Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = {Conversation}