const 
    express = require('express'),
    app = module.exports = express(),
    server = require('http').createServer(app),
    Stopwatch = require('./models/stopwatch'),
    errorHandler = require('errorhandler'),
    expressLayouts = require('express-ejs-layouts');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.set("WWW-Authenticate", "Basic realm='timer'").status(401).send('Unauthorized');
    }
    else {
        const authTokens = authHeader.split(' ');
        if (authTokens[0] === 'Basic') {
            const credentials = Buffer.from(authTokens[1], 'base64').toString('utf8');

            if (credentials !== process.env.BASIC_AUTH) {  // this is obviously not the most secure way, but we don't care
                return res.status(401).send('Unauthorized');
            }
            else {
                next();
            }
        } else {
            return res.status(401).send('Unauthorized');
        }
    }
};

// Configuration

if (process.env.BASIC_AUTH) {
    app.use(auth);
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

if (process.env.NODE_ENV === 'production') {
    app.use(errorHandler());
}


// Use the port and host
var port = process.env.PORT || 5000; 
var host = process.env.HOST || '0.0.0.0';

var prefix = process.env.PREFIX || '';

const halls = (process.env.HALLS || ((process.env.PREFIX || "") + ":" + (process.env.TITLE || "TIMER"))).replace("; ?$", "").split(';').map(tuple => {
    const parts = tuple.split(':');
    return {"prefix": parts[0].trim(), "title": parts[1].trim()};
});

console.log("Configuring halls:", halls)

halls.map(hall => {
    const title = hall["title"]
    const prefix = hall["prefix"]
    const router = express.Router();

    const io = require('socket.io')(server, {path: prefix + '/socket.io'})

    router.use(expressLayouts);
    router.use(express.static(__dirname + '/public'));

    var stopwatch = new Stopwatch();

    stopwatch.on('tick:stopwatch', function(time) {
        io.sockets.emit('time', { time: time });
    });

    stopwatch.on('reset:stopwatch', function(time) {
        io.sockets.emit('time', { time: time });
    });

    // stopwatch.start();  // we probably don't want autostart on server start

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


    router.get('/', function(req, res) {
        res.render('index', { title: title, prefix: prefix });
    });


    const control = express.Router();

    control.get('/', function(req, res) {
        res.render('control', { title: title, prefix: prefix });
    });
    control.post('/reset/', function (req, res) {
        stopwatch.reset();
        res.send("OK");
    });
    control.post('/reset-short/', function (req, res) {
        stopwatch.resetShort();
        res.send("OK");
    });
    control.post('/start-from-reset/', function (req, res) {
        stopwatch.reset();
        stopwatch.start();
        res.send("OK");
    });
    control.post('/start-from-reset-short/', function (req, res) {
        stopwatch.resetShort();
        stopwatch.start();
        res.send("OK");
    });
    control.post('/start/', function (req, res) {
        stopwatch.start();
        res.send("OK");
    });
    control.post('/stop/', function (req, res) {
        stopwatch.stop();
        res.send("OK");
    });
    control.post('/zero/', function (req, res) {
        stopwatch.zero();
        res.send("OK");
    });

    router.use('/control', control);

    app.use(prefix, router);
});

server.listen(port, host, function() {
    console.log("Express server listening on %j in %s mode", server.address(), app.settings.env);
});

if (halls.length != 1 && halls[0]["prefix"] != "") {
    app.get('/', function(req, res) {
        res.render("list", { layout: false, halls: halls });
    });
}

