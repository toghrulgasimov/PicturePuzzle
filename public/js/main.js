var socket = io();

socket.on('connect', function () {
    var room = $('#room').val();

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
