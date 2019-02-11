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

var app = express();

var io = socket_io();
app.io = io;

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
                dbo.collection("users").findOne({'_id': new ObjectID(params.player)}, function (error, user) {
                    doc.players.push({
                        '_id': params.player,
                        'firstName': user.firstName,
                        'lastName': user.lastName,
                        'rank': -1,
                        'score': 0,
                        'finishDuration': doc.duration + 1
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
                    contest.players[i].finishDuration = contest.startDate.getTime() - params.finishDuration;
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
        Contest.findOne({room: contest.room}, function (err, doc) {
            doc.players.sort(function (a, b) {
                return a.finishDuration - b.finishDuration;
            });
            for (i = 0; i < doc.players.length; i++) {
                doc.players[i].rank = i + 1;
                if (doc.players[i].finishDuration > doc.duration)
                    doc.players[i].finishDuration = 0;
            }
            doc.status = 2;
            doc.save();
            io.to(contest.room).emit('finishContest', doc);
        });
    }, null, true, 'America/Los_Angeles');
}

//contest maker
setImmediate((arg) => {
    console.log(arg);
    let imageIndex = 1;
    setInterval(() => {

        let newContest = new Contest({
            room: new Date().getTime(),
            duration: 1000 * 120,
            picture: "images/contest/" + (imageIndex++) + ".jpg",
            startDate: new Date(new Date().getTime() + 1000 * 20),
            createDate: new Date().getTime(),
            status: 0,
            players: [],
        });

        newContest.save().then((contest) => {
            console.log("New contest was created", contest);
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
