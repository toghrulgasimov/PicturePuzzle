const urlParams = new URLSearchParams(window.location.search);
const contestRoom = urlParams.get('contest');
if (contestRoom != null) {

    var socket = io();

    socket.on('connect', function () {
        var room = contestRoom;

        //ToDo
        //send user participant data
        socket.emit('join', room, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Connected to server');

                $.ajax({
                    url: 'http://localhost:3000/contest',
                    type: 'post',
                    data: {room: room},
                    success: function (contest) {
                        if (contest.status == 1 || contest.status == 1)
                            startContest(contest);
                        else
                            console.log("waiting to start");
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        console.log(jqXhr, textStatus, errorThrown);
                    }
                });
            }
        });
    });


    socket.on('startContest', function (params) {
        startContest();
        console.log("Contest finished")
    });
    socket.on('finishContest', function (params) {
        console.log("Contest finished");
        //show statistics
    });

    //event for case of finishing in time

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




