var socket = io();

function getContests() {
    $.ajax({
        url: 'http://localhost:3003/contests',
        type: 'post',
        data: {},
        success: function (data) {
            $('#contestBody').html('');
            for (i = 0; i < data.length; i++) {
                let contest = $(`<tr id="${data[i].room}" onclick="joinContest(this.id);">
                                        <td>${data[i].room}</td>
                                        <td>${moment(data[i].startDate).format("HH:mm:ss")}</td>
                                        <td>${data[i].duration / 1000} saniyə</td>
                                        <td>${data[i].players.length }</td>
                                    </tr>`);

                $('#contestBody').append(contest);
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(jqXhr, textStatus, errorThrown);
        }
    });
}

function joinContest(contestRoom) {
    window.location = "http://localhost:3003/start?contest=" + contestRoom;
}

socket.on('connect', function () {
    console.log('Connected to server');

    getContests();

    setInterval(() => {
        getContests();
    }, 1000 * 10);
});

socket.on('disconnect', function () {
    console.log('Disconnected from  server');
});
