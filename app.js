var express = require('express'),
    app = module.exports = express.createServer(express.logger()),
    io = require('socket.io').listen(app);
    Stopwatch = require('./models/stopwatch'),
    routes = require('./routes');

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

// Routes

// Use the port that Heroku provides or default to 5000
var port = process.env.PORT || 5000; 
var host = process.env.HOST || '0.0.0.0';
app.listen(port, host, function() {
  console.log("Express server listening on %j in %s mode", app.address(), app.settings.env);
});

// configure title
app.title = process.env.TITLE || 'Timer'

app.get('/', routes.index);

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
