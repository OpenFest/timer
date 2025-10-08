'use strict';

import events from 'events';
import { hrtime } from 'node:process';

const TIMESCALE = 1000n * 1000n * 1000n; // ns in s
const PRECISION = 1000; // run every 1000ms

function formatTime(time) {
  time /= TIMESCALE;

  const h = (time / 60n / 60n) % 24n;
  const m = (time / 60n) % 60n;
  const s = time % 60n;

  return [h, m, s].map((x) => new String(x).padStart(2, '0')).join(':');
}

class Stopwatch extends events.EventEmitter {
  constructor() {
    super();

    this.time = 0n;
    this.interval = undefined;

    this.lastTs = process.hrtime.bigint();
  }

  start() {
    if (this.interval) return;

    this.lastTs = process.hrtime.bigint();

    this.interval = setInterval(this.onTick.bind(this), PRECISION);
    this.emit('start:stopwatch');
    this.emit('tick:stopwatch', formatTime(this.time));
  }

  stop() {
    if (!this.interval) return;

    clearInterval(this.interval);
    this.interval = undefined;

    this.emit('stop:stopwatch');
    this.emit('tick:stopwatch', formatTime(this.time));
  }

  reset(minutes) {
    this.time = BigInt(minutes * 60) * TIMESCALE;
    this.emit('reset:stopwatch', formatTime(this.time));
    this.emit('tick:stopwatch', formatTime(this.time));
  }

  onTick() {
    const now = process.hrtime.bigint();
    const delta = now - this.lastTs;
    this.lastTs = now;
    this.time -= delta;

    // we must cap this, so we don't get -1 as time
    if (this.time <= 0) this.time = 0n;

    if (this.time == 0) this.stop();
    else this.emit('tick:stopwatch', formatTime(this.time));
  }

  getTime() {
    return formatTime(this.time);
  }
}

export default Stopwatch;
