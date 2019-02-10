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
                    url: 'http://localhost:3000/contest',
                    type: 'post',
                    data: {room: contestRoom},
                    success: function (contest) {
                        if (contest.status == 1)
                            startContest(contest);
                        else
                            console.log("waiting to start");
                        //ToDo
                        //show modal with time until game starts
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        console.log(jqXhr, textStatus, errorThrown);
                    }
                });
            }
        });
    });


    socket.on('startContest', function (params) {
        //ToDo
        //hide wait modal
        startContest(params);
        console.log("Contest started")
    });

    socket.on('finishContest', function (params) {
        alert("Contest finished");
        window.location = "http://localhost:3000";
        //ToDO
        //show statistics
    });

    function finishInTime() {

        var params = {
            room: contestRoom,
            finishDuration: new Date(),
            player: getCookie('_id')
        };
        socket.emit('finishInTime', params, function () {
            //ToDO
            //action after finishing
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
    console.log(jigsaw);
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




