'use strict';

import express from 'express';
import { createServer } from 'http';
import errorHandler from 'errorhandler';
import expressLayouts from 'express-ejs-layouts';
import config from './config.js';
import { Server as SIO } from 'socket.io';

import Stopwatch from './stopwatch.js';

const app = express();
const server = createServer(app);
const io = new SIO(server, {});

// Configuration

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('./public'));

server.listen(config.listen, () => {
  console.log('server started');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

for (const [slug, name] of Object.entries(config.rooms)) {
  const stopwatch = new Stopwatch();

  const ns = io.of(`/${slug}`);

  stopwatch.on('tick:stopwatch', (time) => ns.emit('time', { time: time }));
  stopwatch.on('reset:stopwatch', (time) => ns.emit('time', { time: time }));

  stopwatch.start();

  ns.on('connection', function (socket) {
    ns.emit('time', { time: stopwatch.getTime() });

    socket.on('click:start', () => stopwatch.start());
    socket.on('click:stop', () => stopwatch.stop());
    socket.on('click:zero', () => stopwatch.zero());
    socket.on('click:reset', () => stopwatch.reset());
    socket.on('click:resetShort', () => stopwatch.resetShort());
  });

  const roomRouter = express.Router();

  roomRouter.get('/', function (req, res) {
    res.render('index', { title: name, room: slug });
  });

  const control = express.Router();

  control.get('/', function (req, res) {
    res.render('control', { title: name, room: slug });
  });
  control.post('/reset/', function (req, res) {
    stopwatch.reset();
    res.send('OK');
  });
  control.post('/reset-short/', function (req, res) {
    stopwatch.resetShort();
    res.send('OK');
  });
  control.post('/start-from-reset/', function (req, res) {
    stopwatch.reset();
    stopwatch.start();
    res.send('OK');
  });
  control.post('/start-from-reset-short/', function (req, res) {
    stopwatch.resetShort();
    stopwatch.start();
    res.send('OK');
  });
  control.post('/start/', function (req, res) {
    stopwatch.start();
    res.send('OK');
  });
  control.post('/stop/', function (req, res) {
    stopwatch.stop();
    res.send('OK');
  });
  control.post('/zero/', function (req, res) {
    stopwatch.zero();
    res.send('OK');
  });

  roomRouter.use('/control', control);

  app.use(`/${slug}`, roomRouter);
}

app.get('/', function (req, res) {
  res.render('list', { title: 'Timer', rooms: config.rooms });
});
