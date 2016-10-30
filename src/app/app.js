import os from 'os';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import request from 'superagent';
import {Socket} from 'phoenix-socket';
import uuid from 'node-uuid';
import WebSocket from 'websocket';
import XMLHttpRequest from 'xhr2';

import pkg from '../../package.json';

export function configDir() {
  return path.join(os.homedir ? os.homedir() : require('homedir')(), '.microcrawler');
}

export const TOKEN_PATH = path.join(configDir(), 'token.jwt');

export const TOKEN = ((tokenPath) => {
  if (fs.existsSync(tokenPath) === false) {
    return null;
  }

  return fs.readFileSync(tokenPath).toString().trim();
})(TOKEN_PATH);

export const DEFAULT_URL = 'ws://localhost:4000/worker';
export const DEFAULT_URL_AUTH = 'http://localhost:4000/api/v1/auth/signin';
export const DEFAULT_CHANNEL = 'worker:lobby';
export const DEFAULT_TOKEN = TOKEN;
export const DEFAULT_HEARTBEAT_INTERVAL = 10000;

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = XMLHttpRequest;
global.window = {
  WebSocket: WebSocket.w3cwebsocket,
  XMLHttpRequest
};

/**
 * Construct message which is send during joining the channel
 * @returns {{token: *, uuid: *, name, version, os: {cpus: *, endian: *, hostname: *, platform: *, uptime: *, mem: {total: *, free: *}, load: *}}}
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
 * @param token Authorization token
 * @param registerPingFunction Function used for registering ping function - callback
 * @param unregisterPingFunction Function used for unregistering ping function - callback
 */
export function createChannel(socket, channelName, token, registerPingFunction, unregisterPingFunction) {
  const channel = socket.channel(channelName, constructJoinMessage(token));

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

  channel.on('crawl', (payload) => {
    console.log('Received event - crawl');
    console.log(JSON.stringify(payload, null, 4));
    // simulate some work
    const workDuration = (JSON.stringify(payload, null, 4).split('.').length - 1) * 1000;
    const work = function work() {
      const msg = {
        done: payload
      };
      channel.push('done', msg);
    };
    setTimeout(work, workDuration);
  });

  channel.on('pong', (payload) => {
    console.log('Received event - pong');
    console.log(JSON.stringify(payload, null, 4));
  });

  channel.push('msg', {msg: 'Hello World!'});
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

/**
 * Send ping function to channel
 * @param channel Channel to send the message to
 * @param id ID of the message
 */
export function pingFunction(channel, id) {
  console.log('Executing ping function.');
  channel.push('ping', constructPingMessage(id));
}

export default class App {
  constructor() {
    this.pingFunctionInterval = null;
  }

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

  main(args = process.argv) {
    program
      .version(pkg.version)
      .option('-c, --channel <CHANNEL>', `Channel to connect to, default: ${DEFAULT_CHANNEL}`)
      .option('--heartbeat-interval <MILLISECONDS>', `Heartbeat interval in milliseconds, default: ${DEFAULT_HEARTBEAT_INTERVAL}`)
      .option('-i, --interactive', 'Run interactive mode')
      .option('-u, --url <URL>', `URL to connect to, default: ${DEFAULT_URL}`)
      .option('-t, --token <TOKEN>', `Token used for authorization, default: ${DEFAULT_TOKEN}`)
      .option('-a, --url-auth <URL>', `URL used for authentication, default: ${DEFAULT_URL_AUTH}`)
      .option('--username <EMAIL>', 'Username')
      .option('--password <PASSWORD>', 'Password')
      .parse(args);

    let promise = Promise.resolve(true);

    const urlAuth = program.urlAuth || DEFAULT_URL_AUTH;
    const username = program.username;
    const password = program.password;
    if (username && password) {
      const payload = {
        email: username,
        password
      };

      promise = new Promise(
        (resolve, reject) => {
          request
            .post(urlAuth)
            .send(payload)
            .end(
              (err, result) => {
                if (err) {
                  return reject(err);
                }

                return resolve(result);
              }
            );
        }
      );

      promise.then(
        (result) => {
          const jwt = result.body.jwt;
          console.log(`Storing token in ${TOKEN_PATH}`);
          fs.writeFileSync(TOKEN_PATH, `${jwt}\n`);
        },
        (error) => {
          console.log(error);
        }
      );
    }

    promise.then(() => {
      // Create socket
      const url = program.url || DEFAULT_URL;
      const token = program.token || DEFAULT_TOKEN;
      const socket = createSocket(url, token, this.unregisterPingFunction.bind(this));

      // Try to connect
      socket.connect();

      // Create channel
      const channelName = program.channel || DEFAULT_CHANNEL;

      /* const channel = */ createChannel(socket, channelName, this.registerPingFunction.bind(this), this.unregisterPingFunction.bind(this));
    });
  }
}
