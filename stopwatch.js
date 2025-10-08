'use strict';

import events from 'events';

const TIMESCALE = 1000;

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

    this.time = 0;
    this.interval = undefined;

    this.tickRate = TIMESCALE;
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(this.onTick.bind(this), this.tickRate);
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

  reset(time) {
    this.time = time * 60 * TIMESCALE;
    this.emit('reset:stopwatch', formatTime(this.time));
    this.emit('tick:stopwatch', formatTime(this.time));
  }

  onTick() {
    this.time -= this.tickRate;

    // we must cap this, so we don't get -1 as time
    if (this.time <= 0) this.time = 0;

    if (this.time == 0) this.stop();
    else this.emit('tick:stopwatch', formatTime(this.time));
  }

  getTime() {
    return formatTime(this.time);
  }
}

export default Stopwatch;
