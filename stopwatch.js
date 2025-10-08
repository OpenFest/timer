'use strict';

import events from 'events';

const TIMESCALE = 1000;

const DEFAULT_TIME = 45 * 60 * TIMESCALE;
const DEFAULT_SHORT_TIME = 5 * 60 * TIMESCALE;

function formatTime(time) {
  time /= TIMESCALE;

  const h = Math.floor(time / 60 / 60) % 24;
  const m = Math.floor(time / 60) % 60;
  const s = Math.floor(time) % 60;

  return [h, m, s].map((x) => new String(x).padStart(2, '0')).join(':');
}

class Stopwatch extends events.EventEmitter {
  constructor() {
    super();

    this.time = DEFAULT_TIME;
    this.interval = undefined;

    this.tickRate = TIMESCALE;
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(this.onTick.bind(this), this.tickRate);
    this.emit('start:stopwatch');
  }

  stop() {
    if (!this.interval) return;

    clearInterval(this.interval);
    this.interval = undefined;

    this.emit('stop:stopwatch');
  }

  reset() {
    this.time = DEFAULT_TIME;
    this.emit('reset:stopwatch', formatTime(this.time));
  }

  zero() {
    this.time = 0;
    this.emit('reset:stopwatch', formatTime(this.time));
  }

  resetShort() {
    this.time = DEFAULT_SHORT_TIME;
    this.emit('reset:stopwatch', formatTime(this.time));
  }

  onTick() {
    this.time -= this.tickRate;

    this.emit('tick:stopwatch', formatTime(this.time));

    if (this.time <= 0) {
      this.time = 0;
      this.stop();
    }
  }

  getTime() {
    return formatTime(this.time);
  }
}

export default Stopwatch;
