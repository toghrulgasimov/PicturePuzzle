const urlParams = new URLSearchParams(window.location.search);
const contestRoom = urlParams.get('contest');
if (contestRoom != null){
    alert(contestRoom);

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
            }
        });
    });



    socket.on('disconnect', function () {
        console.log('Disconnected from  server');
    });
}




