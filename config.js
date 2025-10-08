'use strict';

const config = {
  rooms: {
    'room-a': 'Hall A',
    'room-b': 'Hall B',
  },
  listen: '/var/run/timer/timer.sock',
  timers: {
    Long: 40,
    Short: 5,
  },
};

export default config;
