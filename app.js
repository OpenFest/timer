var express = require('express'),
    app = module.exports = express(),
    server = require('http').createServer(app),
    Stopwatch = require('./models/stopwatch'),
    errorHandler = require('errorhandler'),
    expressLayouts = require('express-ejs-layouts'),
    io = require('socket.io')(server, {});

// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static(__dirname + '/public'));

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

if (process.env.NODE_ENV === 'production') {
    app.use(errorHandler());
}


// Use the port that Heroku provides or default to 5000
var port = process.env.PORT || 5000; 
var host = process.env.HOST || '0.0.0.0';

server.listen(port, host, function() {
        console.log("Express server listening on %j in %s mode", server.address(), app.settings.env);
        });
var stopwatch = new Stopwatch();
stopwatch.on('tick:stopwatch', function(time) {
        io.sockets.emit('time', { time: time });
        });

stopwatch.on('reset:stopwatch', function(time) {
        io.sockets.emit('time', { time: time });
        });

stopwatch.start();

io.sockets.on('connection', function (socket) {
        io.sockets.emit('time', { time: stopwatch.getTime() });

        socket.on('click:start', function () {
                stopwatch.start();
                });

        socket.on('click:stop', function () {
                stopwatch.stop();
                });

        socket.on('click:zero', function () {
                stopwatch.zero();
                });

        socket.on('click:reset', function () {
                stopwatch.reset();
                });

        socket.on('click:resetShort', function () {
                stopwatch.resetShort();
                });
});


// configure title
//app.use(function (req, res, next) {
//    res.locals.title = process.env.TITLE || 'Timer'
//});

app.get('/', function(req, res) {
    res.render('index', { title: process.env.TITLE });
});

app.get('/control/', function(req, res) {
    res.render('control', { title: process.env.TITLE });
});

app.post('/reset/', function (req, res) {
    stopwatch.reset();
    res.send("OK");
});

app.post('/reset-short/', function (req, res) {
    stopwatch.resetShort();
    res.send("OK");
});

app.post('/start-from-reset/', function (req, res) {
    stopwatch.reset();
    stopwatch.start();
    res.send("OK");
});

app.post('/start-from-reset-short/', function (req, res) {
    stopwatch.resetShort();
    stopwatch.start();
    res.send("OK");
});

app.post('/start/', function (req, res) {
    stopwatch.start();
    res.send("OK");
});

app.post('/stop/', function (req, res) {
    stopwatch.stop();
    res.send("OK");
});

app.post('/zero/', function (req, res) {
    stopwatch.zero();
    res.send("OK");
});
