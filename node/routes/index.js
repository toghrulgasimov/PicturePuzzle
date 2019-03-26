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
var request = require('sync-request');

router.get('/', async function (req, res) {
    console.log("puzzle game");

    if (req.query._id == undefined && req.cookies._id == undefined) {
        // avto qeydiyyatdan kecmelidi
//http://localhost/getonline
        var ress = request('GET', 'http://localhost:3000/users/getuserinfo');
        req.query = JSON.parse(ress.getBody());
        let s = fs.readFileSync("./public/menu2.html") + "";
        const $ = cheerio.load(s);
        //$('#info').attr("r", 'Reytinq ' + user.mission);
        //res.send($.html());//test
    }else {
        req.query = req.cookies;
    }
    let user = await PuzzlePlayer.findOne({_id: req.query._id});
    if (user == null) {
        let data = req.query;
        data.score = 500;
        data.mission = 1;
        console.log(data);
        user = new PuzzlePlayer(data);
        user = await user.save();
    }
    console.log(user);
    res.cookie('_id', user._id);
    res.cookie('mission', user.mission);
    res.cookie('score', user.score);
    let s = fs.readFileSync("./public/menu2.html") + "";
    const $ = cheerio.load(s);
    $('#info').attr("r", 'Mərhələ ' + user.mission);
    res.send($.html());//test
});

router.post('/nextmission', async function (req, res) {
    console.log("nextx mission post");
    let _id = req.cookies._id;

    let currMission = parseInt(req.cookies.mission);
    currMission++;
    res.cookie('mission', currMission);
    await PuzzlePlayer.findOneAndUpdate({_id: _id}, {$set: {mission: currMission}});
    res.send("succes");
});
router.get('/interstitial', async function (req, res) {
    res.send("succes");
});



router.get('/start', function (req, res) {
    let s = fs.readFileSync("./public/indexx.html") + "";
    const $ = cheerio.load(s);
    $("#infoid").text(req.cookies._id);
    $("#infoid").attr("mission", req.cookies.mission);
    let mission = req.cookies.mission;
    console.log(mission);
    res.send($.html());//test
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
router.post('/reclamprofile', function (req, res) {
    Contest.findOne({'room': req.body.room}, function (error, contest) {
        if (!error) {
            res.status(200).send(contest);
        } else {
            console.log(error);
            res.status(520).send(error);
        }
    });
});

router.get('/border', async function (req, res) {
    let s = fs.readFileSync("./public/border.html") + "";
    const $ = cheerio.load(s);
    let a = $("#table");
    let ps = await PuzzlePlayer.find({}).sort({mission:-1});
    for(let i = 0; i < ps.length; i++) {
        let t = "<tr class='clickable-row' data-href='http://localhost:3000/users/getUser?id="+ps[i]._id+"'>\n" +
            "        <th class='align-middle' scope=\"row\">"+(i+1)+"</th>\n" +
            "        <td class='align-middle'><img src='http://localhost:3000/profile/"+ps[i].image+"' width='40px' height='40px'>"+("")+"</td>\n" +
            "        <td class='align-middle'>"+(ps[i].firstName +" " +  ps[i].lastName)+"</td>\n" +
            "        <td class='align-middle'>"+(ps[i].mission)+"</td>\n" +
            "    </tr>"
        a.append(t);
    }
    res.send($.html());
});

module.exports = router;