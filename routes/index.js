var express = require('express');
var router = express.Router();
let fs = require('fs');
let path = require('path');
const _ = require('lodash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');
const {mongoose} = require('../dao/mongoose');
const {Contest} = require('../models/contest');

router.get('/', function (req, res) {
    let s = fs.readFileSync("./public/menu.html") + "";
    res.send(s);//test
});

router.get('/start', function (req, res) {
    let s = fs.readFileSync("./public/indexx.html") + "";
    res.send(s);//test
});

router.get('/contests', function (req, res) {
    let s = fs.readFileSync("./public/contestlist.html") + "";
    res.send(s);
});

router.post('/contests', function (req, res) {
    Contest.find({'status': 0}, function (error, contestList) {
        if (!error) {
            res.status(200).send(contestList);
        } else {
            console.log(error);
            res.status(520).send(error);
        }
    });
});

module.exports = router;
