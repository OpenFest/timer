//var socket = io.connect(window.location.hostname);
var socket = io();

socket.on('time', function (data) {
    $('#countdown').html(data.time);
});

$('#start').click(function() {
    socket.emit('click:start');
});

$('#stop').click(function() {
    socket.emit('click:stop');
});

$('#reset').click(function() {
    socket.emit('click:reset');
});

$('#resetShort').click(function() {
    socket.emit('click:resetShort');
});
