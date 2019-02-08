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
const {PuzzlePlayer} = require('../models/player');
const cheerio = require('cheerio');

router.get('/', async function (req, res) {
    console.log("gettt");

    if(req.query.id == undefined) return;
    let user = await PuzzlePlayer.findOne({_id:req.query.id});
    if(user == null) {
        user = new PuzzlePlayer({_id:req.query.id, mission: 1});
        user = await user.save();
    }
    console.log(user);
    res.cookie('_id', user._id);
    res.cookie('mission', user.mission);
    let s = fs.readFileSync("./public/menu.html") + "";
    const $ = cheerio.load(s);
    $('#rinfo').text('Reytinq ' + user.mission);
    res.send($.html());//test
});

router.post('/nextmission', async function (req, res) {
    console.log("nextx mission post");
    let _id = req.cookies._id;

    let currMission = parseInt(req.cookies.mission);
    currMission++;
    res.cookie('mission', currMission);
    await PuzzlePlayer.findOneAndUpdate({_id:_id}, {$set:{mission:currMission}});
    res.send("succes");
});

router.get('/start', function (req, res) {
    let s = fs.readFileSync("./public/indexx.html") + "";
    let mission = req.cookies.mission;
    console.log(mission);
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

router.post('/contest', function (req, res) {
    Contest.findOne({'room': req.body.room}, function (error, contest) {
        if (!error) {
            res.status(200).send(contest);
        } else {
            console.log(error);
            res.status(520).send(error);
        }
    });
});

module.exports = router;
