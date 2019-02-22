const urlParams = new URLSearchParams(window.location.search);
const contestRoom = urlParams.get('contest');
if (contestRoom != null) {

    var socket = io();

    socket.on('connect', function () {

        var params = {
            room: contestRoom,
            player: getCookie('_id')
        };

        socket.emit('join', params, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Connected to server');

                $.ajax({
                    url: 'http://35.231.39.26:3003/contest',
                    type: 'post',
                    data: {room: contestRoom},
                    success: function (contest) {
                        if (contest.status == 1) {
                            startContest(contest);
                        }
                        else {
                            setInterval(() => {
                                $('#leftTime span').text(parseInt((new Date(contest.startDate).getTime() - new Date().getTime()) / 1000));
                            }, 1000);
                            console.log("waiting to start");
                            $('#waitingModal').modal({
                                backdrop: 'static',
                                keyboard: false,
                                show: true
                            });
                        }
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        console.log(jqXhr, textStatus, errorThrown);
                    }
                });
            }
        });
    });

    socket.on('startContest', function (contest) {
        $('#leftTime').html('Yarış başladı');
        setTimeout(() => {
            $('#waitingModal').modal("hide");
            startContest(contest);
            console.log("Contest started")
        }, 1000);
    });

    socket.on('finishContest', function (contest) {
        console.log(contest);
        console.log("Contest finished");
        $('#resultBody').html('');
        for (i = 0; i < contest.players.length; i++) {
            let player = $(`<tr id="${contest.players[i]._id}">
                                <td>${contest.players[i].rank}</td>
                                <td>${contest.players[i].firstName + " " + contest.players[i].lastName}</td>
                                <td>${contest.players[i].finishDuration == 0 ? "Bitirmədi" : parseInt(contest.players[i].finishDuration / 1000) + " saniyə"}</td>
                                <td>${contest.players[i].score}</td>
                            </tr>`);

            $('#resultBody').append(player);
        }
        $('#resultModal').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
    });

    function finishInTime() {
        var params = {
            room: contestRoom,
            finishDuration: new Date().getTime(),
            player: getCookie('_id')
        };
        socket.emit('finishInTime', params, function (contest) {
            console.log(contest);
            console.log("Congratulations, you finished contest earlier");
            $('#resultBody').html('');
            for (i = 0; i < contest.players.length; i++) {
                let player = $(`<tr id="${contest.players[i]._id}">
                                <td>${contest.players[i].rank}</td>
                                <td>${contest.players[i].firstName + " " + contest.players[i].lastName}</td>
                                <td>${contest.players[i].finishDuration > contest.duration ? "Bitirməyib" : parseInt(contest.players[i].finishDuration / 1000) + " saniyə"} </td>
                                <td>${contest.players[i].score}</td>
                            </tr>`);

                $('#resultBody').append(player);
            }
            $('#resultModal').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
        });
    };

    socket.on('disconnect', function () {
        console.log('Disconnected from  server');
    });
}

function startContest(contest) {
    var jsaw = new jigsaw.Jigsaw({
        spread: .7,
        offsetTop: 0,
        maxWidth: 705,
        maxHeight: 470,
        defaultImage: contest.picture,
        piecesNumberTmpl: "%d Pieces",
        redirect: "",
        border: true,
        defaultPieces: 10,
        shuffled: true,
        rotatePieces: false,
        numberOfPieces: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        squarePieces: false
    });
    if (jigsaw.GET["image"]) {
        jsaw.set_image(jigsaw.GET["image"]);
    }
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}



