import cheerio from 'cheerio';
import os from 'os';
import request from 'superagent';
import {Socket} from 'phoenix-socket';
import uuid from 'node-uuid';

import pkg from '../../package.json';

/**
 * Construct message which is send during joining the channel
 * @returns {{uuid: *, name, version, os: {cpus: *, endian: *, hostname: *, platform: *, uptime: *, mem: {total: *, free: *}, load: *}}}
 */
export function constructJoinMessage() {
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

/**
 * Construct ping message
 * @param id ID of the message to be send
 * @returns {{id: *, msg: string, os: {mem: {total: *, free: *}, load: *, uptime: *}}}
 */
export function constructPingMessage(id) {
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

/**
 * Create new channel
 * @param socket Socket to be used for creating channel
 * @param channelName Name of channel to be joined to
 * @param registerPingFunction Function used for registering ping function - callback
 * @param unregisterPingFunction Function used for unregistering ping function - callback
 */
export function createChannel(socket, channelName, registerPingFunction, unregisterPingFunction, crawlers) {
  const channel = socket.channel(channelName, constructJoinMessage());

  /* const _channel = */
  channel.join()
    .receive('ok', (payload) => {
      console.log('Received ok');
      console.log(JSON.stringify(payload, null, 4));
      registerPingFunction(channel);
    })
    .receive('error', ({reason}) => {
      console.log('Failed join', reason);
      unregisterPingFunction();
    })
    .receive('timeout', () => {
      console.log('Networking issue. Still waiting...');
    });

  channel.on('crawl', (data) => {
    console.log('Received event - crawl');

    let payload = null;
    try {
      payload = JSON.parse(data.payload);
    } catch (e) {
      console.log(`Parsing JSON failed, reason: ${e}`, e, data.payload);
    }

    console.log(JSON.stringify(payload, null, 4));

    request
      .get(payload.url)
      .end(
        (err, result) => {
          if (err) {
            return channel.push('done', {
              error: err
            });
          }

          const text = result.text;
          const doc = cheerio.load(text);

          const crawler = crawlers[payload.crawler] || {};
          console.log(crawler);
          if (crawler === {}) {
            console.log(`Unable to find crawler named: '${payload.crawler}'`);
          }

          const processor = crawler.processors && crawler.processors[payload.processor];
          if (processor) {
            const response = processor(doc, payload);
            console.log(JSON.stringify(response, null, 4));

            return channel.push('done', response);
          }

          console.log(`Unable to find processor named: '${payload.processor}'`);

          return channel.push('done', {
            error: 'crawler/processor not found'
          });
        }
      );
  });

  channel.on('pong', (payload) => {
    console.log('Received event - pong');
    console.log(JSON.stringify(payload, null, 4));
  });

  channel.push('msg', {msg: 'Hello World!'});
}

/**
 * Send ping function to channel
 * @param channel Channel to send the message to
 * @param id ID of the message
 */
export function pingFunction(channel, id) {
  console.log('Executing ping function.');
  channel.push('ping', constructPingMessage(id));
}

/**
 * Create socket
 * @param url - URL to be connected to
 * @param token - jwt for worker authentication
 * @param unregisterPingFunction
 * @returns {Socket}
 */
export function createSocket(url, token, unregisterPingFunction) {
  console.log(`Connecting to "${url}"`);
  const socket = new Socket(url, {
    params: {guardian_token: token},
    transport: global.window.WebSocket
  });

  // Error handler
  socket.onError((err) => {
    console.log('There was an error with the connection!');
    unregisterPingFunction();
    console.log(err);
  });

  // Close handler
  socket.onClose(() => {
    console.log('The connection dropped.');
    unregisterPingFunction();
  });

  return socket;
}

export default class Channel {
  /**
   * Register ping function
   * @param channel Channel to be used by ping fuction
   * @param heartbeatInterval Interval between pings
   */
  registerPingFunction(channel, heartbeatInterval = 10000) {
    console.log('Registering ping function.');

    let id = 0;
    this.pingFunctionInterval = setInterval(
      () => {
        pingFunction(channel, id);
        id += 1;
      },
      heartbeatInterval
    );
  }

  /**
   * Unegister ping function
   */
  unregisterPingFunction() {
    if (this.pingFunctionInterval) {
      console.log('Unregistering ping function.');
      clearInterval(this.pingFunctionInterval);
      this.pingFunctionInterval = null;
    }
  }

  initialize(url, token, channelName, manager) {
    const crawlers = manager.crawlers;

    return new Promise((resolve) => {
      const socket = createSocket(url, token, this.unregisterPingFunction.bind(this));

      // Try to connect
      socket.connect();

      // const channel =
      createChannel(socket, channelName, this.registerPingFunction.bind(this), this.unregisterPingFunction.bind(this), crawlers);

      resolve(this);
    });
  }
}
