var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io = require("socket.io");
var CronJob = require('cron').CronJob;
const {mongoose} = require('./dao/mongoose');
const {ObjectID} = require('mongodb');
const {Contest} = require('./models/contest');
var indexRouter = require('./routes/index');
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/";
const Elo = require('./routes/elo')
const {PuzzlePlayer} = require('./models/player');


var app = express();

var io = socket_io();
app.io = io;


console.log(PuzzlePlayer);
io.on("connection", function (socket) {
    console.log('New user connected');

    socket.on('join', (params, callback) => {

        if (params.room.trim().length == 0) {
            callback('Room name are required.');
        }

        socket.join(params.room);

        Contest.findOne({room: params.room}, function (err, doc) {

            MongoClient.connect(url, function (err, db) {
                let dbo = db.db("profile");
                console.log("-------------------------------------")
                console.log(params.player);
                dbo.collection("users").findOne({'_id': new ObjectID(params.player)}, function (error, user) {
                    doc.players.push({
                        '_id': params.player,
                        'firstName': user.firstName,
                        'lastName': user.lastName,
                        'rank': -1,
                        'score': 0,
                        'percent': 0,
                        'finishDuration': doc.duration + 10000
                    });
                    doc.save();
                    db.close();
                });
            });

        });

        callback();
    });

    socket.on('finishInTime', async (params, callback) => {
        console.log(params + " finished contest");

        await Contest.findOne({room: params.room}, function (err, contest) {

            for (i = 0; i < contest.players.length; i++) {
                if (contest.players[i]._id == params.player) {
                    contest.players[i].percent = 100;
                    contest.players[i].finishDuration = params.finishDuration - contest.startDate.getTime();
                }
            }
            contest.players.sort(function (a, b) {
                return a.finishDuration - b.finishDuration;
            });

            for (i = 0; i < contest.players.length; i++) {
                contest.players[i].rank = i + 1;
            }
            contest.save();

            callback(contest);
        });
    });

    socket.on('getPlayerResult', async function (params) {
        //console.log(params);
        await Contest.findOne({room: params.room}, async function (err, data) {
            data.unfinishedCount++;
            for (i = 0; i < data.players.length; i++) {
                if (data.players[i]._id == params.player) {
                    data.players[i].percent = params.percent;
                    data.players[i].finishDuration = params.finishDuration - data.startDate.getTime();
                    await data.save();
                    break;
                }
            }
        })
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from server');
    });
});

function contestRunner(contest) {
    new CronJob(contest.startDate, function () {
        console.log('Contest : "' + contest.room + '" started');
        Contest.findOne({room: contest.room}, function (err, doc) {
            doc.status = 1;
            doc.save();
            io.to(contest.room).emit('startContest', doc);
        });
    }, null, true, 'America/Los_Angeles');

    new CronJob(new Date(contest.startDate.getTime() + contest.duration), function () {
        console.log('Contest : "' + contest.room + '" finished');
        Contest.findOne({room: contest.room}, async function (err, doc) {
            doc.status = 2;
            //console.log(io.sockets.adapter.rooms[contest.room]);
            if (io.sockets.adapter.rooms[contest.room] != undefined && io.sockets.adapter.rooms[contest.room] != null)
                doc.unfinished = Object.keys(io.sockets.adapter.rooms[contest.room]).length;
            else
                doc.unfinished = 0;
            doc.unfinishedCount = 0;
            await doc.save();
            io.to(contest.room).emit('finishContest', doc);
            let isAll = false;
            let counter = 0
            while (!isAll) {
                await Contest.findOne({room: contest.room}, async function (err, data) {
                    if (data.unfinished == data.unfinishedCount || counter > 1000) {
                        isAll = true;
                        data.players.sort(function (a, b) {
                            return b.percent - a.percent || a.finishDuration - b.finishDuration;
                        });
                        for (let i = 0; i < data.players.length; i++) {

                            let p = await PuzzlePlayer.findOne({_id:data.players[i]._id})

                            data.players[i].rank = i + 1;
                            data.players[i].elo = p.score;
                        }



                        // bax burda playerler siralanmis vezyetdedi ranklari verilib
                        //burda data.players siralanmis nomreslenmis listdi  1 ci yerden axirinc yere
                        // ve her player  elementinin icinde score var
                        //
                        //
                        let Calculator = new Elo.ELOMatch();
                        for(let i = 0; i < data.players.length; i++) {
                            Calculator.addPlayer(data.players[i]._id, data.players[i].rank, data.players[i].elo);
                        }
                        let ans = Calculator.calculateELOs();
                        // ans array di arrayda gondermek olur
                        data.ans = ans;
                        io.to(contest.room).emit('contestResults', data);
                        console.log(ans);
                        for(let i = 0; i < ans.length; i++) {
                            let uu = await PuzzlePlayer.findOneAndUpdate({_id:ans[i].name}, {$set:{score : ans[i].eloPost}});
                            console.log("xalllllllllllllllllll" + data.ans[i].eloPost);
                            console.log(uu);
                        }
                        await data.save();
                    } else {
                        counter++;
                    }
                })
            }
        });
    }, null, true, 'America/Los_Angeles');
}

//contest maker
setImmediate((arg) => {
    //console.log(arg);
    let imageIndex = 1;
    setInterval(() => {

        let newContest = new Contest({
            room: new Date().getTime(),
            duration: 1000 * 120,
            picture: "images/contest/" + (imageIndex++) + ".jpg",
            pieces: 12,
            startDate: new Date(new Date().getTime() + 1000 * 20),
            createDate: new Date().getTime(),
            status: 0,
            players: [],
        });

        newContest.save().then((contest) => {
            //console.log("New contest was created", contest);
            contestRunner(contest);
        }).catch((error) => {
            console.log(error);
        });

        if (imageIndex > 4)
            imageIndex = 1;

    }, 1000 * 10);

}, 'Contest job started');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    //
    // // render the error page
    // res.status(err.status || 500);
    // res.render('error');
});

module.exports = app;
