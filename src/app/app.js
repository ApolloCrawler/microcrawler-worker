import os from 'os';
import program from 'commander';
import {Socket, LongPoll} from 'phoenix-socket';
import WebSocket from 'websocket';
import XMLHttpRequest from 'xhr2';

import readline from 'readline';

import pkg from '../../package.json';

export const DEFAULT_URL = 'ws://localhost:4000/socket';
export const DEFAULT_CHANNEL = 'worker:lobby';
export const DEFAULT_TOKEN = null;
export const DEFAULT_HEARTBEAT_INTERVAL = 10000;

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

    // Error handler
    socket.onError((err) => {
      console.log('There was an error with the connection!');
      console.log(err);
    });

    // Close handler
    socket.onClose(() => {
      console.log('The connection dropped.');
    });

    // Try to connect
    socket.connect();

    const channelName = program.channel || DEFAULT_CHANNEL;

    // Create channel
    const token = program.token || DEFAULT_TOKEN;
    const channel = socket.channel(channelName, {token});
    const r = channel.join()
      .receive('ok', (payload) => {
        console.log("Received ok");
        console.log(JSON.stringify(payload, null, 4));
      })
      .receive('error', ({reason}) => {
        console.log("Failed join", reason)
      })
      .receive('timeout', () => {
        console.log("Networking issue. Still waiting...")
      });

    channel.on('crawl', (payload) => {
      console.log('Received event - crawl');
      console.log(JSON.stringify(payload, null, 4));
    });

    channel.on('pong', (payload) => {
      console.log('Received event - pong');
      console.log(JSON.stringify(payload, null, 4));
    });

    const heartbeatInterval = program.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL;
    let id = 0;
    setInterval(() => {
      const msg = {
        id,
        msg: 'I am still alive!',
        name: pkg.name,
        version: pkg.version,
        os: {
          cpus: os.cpus(),
          endian: os.endianness(),
          hostname: os.hostname(),
          platform: os.platform(),
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
    }, parseInt(heartbeatInterval));

    channel.push('msg', {msg: 'Hello World!'});

    const prefix = 'msg> ';
    if (program.interactive) {
      const rl = readline.createInterface(process.stdin, process.stdout);

      const ex = () => {
        process.exit(0);
        console.log('Quitting ...');
      };

      rl.on('line', (line) => {
        // console.log(line);

        const quitCommands = [
          'exit',
          'exit()',
          'x',
          'x()',
          '\\x',
          'quit',
          'quit()',
          'q',
          'q()',
          '\\q'
        ];

        if (quitCommands.indexOf(line) >= 0) {
          ex();
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
      console.log('Type "quit" or press ctrl+c twice to exit.');
      rl.setPrompt(prefix, prefix.length);

      rl.prompt();
    }
  }
};

