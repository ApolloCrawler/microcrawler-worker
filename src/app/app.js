import os from 'os';
import program from 'commander';
import {Socket, LongPoll} from 'phoenix-socket';
import uuid from 'node-uuid';
import WebSocket from 'websocket';
import XMLHttpRequest from 'xhr2';

import readline from 'readline';

import pkg from '../../package.json';

export const DEFAULT_URL = 'ws://localhost:4000/socket';
export const DEFAULT_CHANNEL = 'worker:lobby';
export const DEFAULT_TOKEN = null;
export const DEFAULT_HEARTBEAT_INTERVAL = 10000;

import quitCommands from '../../config/cmds/quit.json';

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = XMLHttpRequest;
global.window = {
  WebSocket: WebSocket.w3cwebsocket,
  XMLHttpRequest
};

export default class App {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .option('-c, --channel <CHANNEL>', `Channel to connect to, default: ${DEFAULT_CHANNEL}`)
      .option('--heartbeat-interval <MILLISECONDS>', `Heartbeat interval in milliseconds, default: ${DEFAULT_HEARTBEAT_INTERVAL}`)
      .option('-i, --interactive', 'Run interactive mode')
      .option('-u, --url <URL>', `URL to connect to, default: ${DEFAULT_URL}`)
      .option('-t, --token <TOKEN>', `Token used for authorization, default: ${DEFAULT_TOKEN}`)
      .parse(args);

    const url = program.url || DEFAULT_URL;

    console.log(`Connecting to "${url}"`);
    let socket = new Socket(url, {transport: global.window.WebSocket});

    let id = 0;
    const pingFunc = () => {
      const msg = {
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

      channel.push('ping', msg);
      id += 1;
    };

    let pingInterval = null;
    const heartbeatInterval = program.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL;
    let registerPingFunction = () => {
      unregisterPingFunction();
      pingInterval = setInterval(pingFunc, parseInt(heartbeatInterval));
    };

    let unregisterPingFunction = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    };

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

    // Try to connect
    socket.connect();

    const channelName = program.channel || DEFAULT_CHANNEL;

    // Create channel
    const token = program.token || DEFAULT_TOKEN;
    const channel = socket.channel(channelName, {
      token,
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
    });

    const r = channel.join()
      .receive('ok', (payload) => {
        console.log("Received ok");
        console.log(JSON.stringify(payload, null, 4));
        registerPingFunction();
      })
      .receive('error', ({reason}) => {
        console.log("Failed join", reason);
        unregisterPingFunction();
      })
      .receive('timeout', () => {
        console.log("Networking issue. Still waiting...")
      });

    channel.on('crawl', (payload) => {
      console.log('Received event - crawl');
      console.log(JSON.stringify(payload, null, 4));
      // simulate some work
      const workDuration = (JSON.stringify(payload, null, 4).split('.').length - 1) * 1000;
      const work = () => {
        const msg = {
          done: payload
        };
        channel.push('done', msg);
      }
      setTimeout(work, workDuration);
    });

    channel.on('pong', (payload) => {
      console.log('Received event - pong');
      console.log(JSON.stringify(payload, null, 4));
    });

    channel.push('msg', {msg: 'Hello World!'});

    const prefix = 'msg> ';
    if (program.interactive) {
      const rl = readline.createInterface(process.stdin, process.stdout);

      const exitFunc = () => {
        process.exit(0);
        console.log('Quitting ...');
      };

      rl.on('line', (line) => {
        if (line === '/ping') {
          pingFunc();
          return;
        }

        if (quitCommands.indexOf(line) >= 0) {
          exitFunc();
        }

        let rawMessage = null;

        try {
          rawMessage = JSON.parse(line);
        } catch(e) {
          rawMessage = line;
        }

        if (rawMessage) {
          channel.push('msg', rawMessage);
        }

        rl.prompt();
      });

      console.log('Running in interactive mode.');
      console.log('Type "quit", "exit" or press ctrl+c twice to exit.');
      rl.setPrompt(prefix, prefix.length);

      rl.prompt();
    }
  }
};

