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
            doc.players.push({'_id': params.player, 'rank': -1, 'finishDuration': -1});
            doc.save();
        });

        callback();
    });

    socket.on('finishInTime', async (params) => {
        console.log(params + " finished contest");

        await Contest.findOne({room: params.room}, function (err, doc) {
            //ToDo
            //player rank and duration
            doc.save();
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from server');
    });
});

function contestRunner(contest) {
    new CronJob(contest.startDate, function () {
        io.to(contest.room).emit('startContest', contest);
        console.log('Contest : "' + contest.room + '" started');
        Contest.findOne({room: contest.room}, function (err, doc) {
            doc.status = 1;
            doc.save();
        });
    }, null, true, 'America/Los_Angeles');

    new CronJob(new Date(contest.startDate.getTime() + contest.duration), function () {
        io.to(contest.room).emit('finishContest', contest);
        console.log('Contest : "' + contest.room + '" finished');
        Contest.findOne({room: contest.room}, function (err, doc) {
            //ToDo
            //player ranks
            doc.status = 2;
            doc.save();
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
