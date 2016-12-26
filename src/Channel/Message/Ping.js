import os from 'os';

export default class PingMessage {
  static construct(id) {
    return {
      id,
      msg: 'I am still alive!',
      os: {
        mem: {
          total: os.totalmem(),
          free: os.freemem(),
        },
        load: os.loadavg(),
        uptime: os.uptime()
      }
    };
  }
}
