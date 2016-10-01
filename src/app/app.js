import program from 'commander';
import {Socket, LongPoll} from 'phoenix-socket';
import XMLHttpRequest from 'xhr2';

import pkg from '../../package.json';

export const DEFAULT_URL = 'ws://localhost:4000/socket/longpoll?token=undefined&vsn=1.0.0';

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = XMLHttpRequest;
global.window = {
  XMLHttpRequest
};

export default class App {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .option('-u, --url <URL>', `URL to connect to, default: ${DEFAULT_URL}`)
      .parse(args);

    const url = program.url || DEFAULT_URL;

    let socket = new Socket(DEFAULT_URL);

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

    // Create channel
    let channel = socket.channel("room:lobby", {token: null});
    channel.join()
      .receive('ok', (data) => {
        console.log("catching up", data);
      })
      .receive('error', ({reason}) => {
        console.log("failed join", reason)
      })
      .receive('timeout', () => {
        console.log("Networking issue. Still waiting...")
      });

    channel.push({msg: "test"});
  }
};
