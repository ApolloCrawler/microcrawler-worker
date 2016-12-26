// import crypto from 'crypto'; // eslint-disable-line no-unused-vars
import os from 'os';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import request from 'superagent';
import WebSocket from 'websocket';
import XMLHttpRequest from 'xhr2';

import pkg from '../../package.json';

import Channel from '../Channel';
import Manager from '../Manager';

export function configDir() {
  return path.join(os.homedir ? os.homedir() : require('homedir')(), '.microcrawler');
}
export const TOKEN_PATH = path.join(configDir(), 'token.jwt');

export function readToken(tokenPath = TOKEN_PATH) {
  if (fs.existsSync(tokenPath) === false) {
    return null;
  }

  return fs.readFileSync(tokenPath).toString().trim();
}

export const TOKEN = readToken(TOKEN_PATH);

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
 * Update token
 * @returns {Promise}
 */
export function updateToken(username, password, urlAuth, tokenFilePath) {
  return new Promise((resolve, reject) => {
    if (!username || !password) {
      return resolve(null);
    }

    const payload = {
      email: username,
      password
    };

    return request
      .post(urlAuth)
      .send(payload)
      .end(
        (err, result) => {
          if (err) {
            return reject(err);
          }

          const jwt = result.body.user.workerJWT;
          console.log(`Storing token in ${tokenFilePath}`);
          fs.writeFileSync(tokenFilePath, `${jwt}\n`);

          return resolve(jwt);
        }
      );
  });
}

export default class App {
  /**
   * App constructor
   */
  constructor() {
    this._channel = new Channel();
    this._manager = new Manager();

    this.pingFunctionInterval = null;
  }

  /**
   * Get Channel Associated with this App
   * @returns {Channel}
   */
  get channel() {
    return this._channel;
  }

  /**
   * Get Manager Associated with this App
   * @returns {Manager}
   */
  get manager() {
    return this._manager;
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

    // Update token if the --username and --password was specified
    this.manager.loadCrawlers().then(
      () => {
        // Get Token - Fetch, Read From File or Return Default
        return updateToken(
          program.username,
          program.password,
          program.urlAuth || DEFAULT_URL_AUTH,
          TOKEN_PATH
        );
      },
      (err) => {
        console.log('Unable to load crawlers', err);
      }
    ).then(
      (newToken) => {
        const token = newToken || program.token || readToken();
        console.log(`Using token: ${token}`);
        // Intitialize Channel for Communication with WebApp (Backend)
        return this.channel.initialize(
          program.url || DEFAULT_URL,
          token,
          program.channel || DEFAULT_CHANNEL,
          this.manager
        );
      },
      (err) => {
        console.log('Unable to updateToken', err);
      }
    );
  }
}
