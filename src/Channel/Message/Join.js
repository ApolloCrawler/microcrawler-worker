import os from 'os';
import uuid from 'node-uuid';

import pkg from '../../../package.json';

export default class JoinMessage {
  static construct() {
    return {
      uuid: uuid.v4(),
      name: pkg.name,
      version: pkg.version,
      os: {
        cpus: os.cpus(),
        endian: os.endianness(),
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: os.uptime(),
        mem: {
          total: os.totalmem(),
          free: os.freemem(),
        },
        load: os.loadavg(),
      }
    };
  }
}
