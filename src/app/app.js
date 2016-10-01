import program from 'commander';
import {Socket, LongPoll} from 'phoenix-socket';
import WebSocket from 'websocket';
import XMLHttpRequest from 'xhr2';

import pkg from '../../package.json';

export const DEFAULT_URL = 'ws://localhost:4000/socket';
export const DEFAULT_CHANNEL = 'worker:lobby';
export const DEFAULT_TOKEN = null;

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
    channel.join()
      .receive('ok', (data) => {
        console.log("Received data", data);
      })
      .receive('error', ({reason}) => {
        console.log("Failed join", reason)
      })
      .receive('timeout', () => {
        console.log("Networking issue. Still waiting...")
      });

    channel.push('msg', {msg: 'Hello World!'});
  }
};
