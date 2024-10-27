// a bit hackish way to find the path but it will get the job done
var socket = io({"path": window.location.pathname.replace(/(\/control\/?|\/)?$/, "") + "/socket.io"});

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
