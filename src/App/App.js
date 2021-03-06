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

import logger from '../Logger';

import crawl from '../crawl';

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

export const DEFAULT_URL = 'ws://localhost:4000';
export const DEFAULT_URL_AUTH = 'http://localhost:4000/api/v1/auth/signin';
export const DEFAULT_CHANNEL = 'worker:lobby';
export const DEFAULT_LOG_LEVEL = 'warn';
export const DEFAULT_TOKEN = TOKEN;
export const DEFAULT_HEARTBEAT_INTERVAL = 10000;
export const DEFAULT_WORKERS_COUNT = 1;

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
          logger.info(`Storing token in ${tokenFilePath}`);
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
    this._channel = null;
    this._manager = null;

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
      .option('--count <COUNT>', `Count of workers, default: ${DEFAULT_WORKERS_COUNT}`)
      .option('--crawl', 'Crawl single page')
      .option('--heartbeat-interval <MILLISECONDS>', `Heartbeat interval in milliseconds, default: ${DEFAULT_HEARTBEAT_INTERVAL}`)
      .option('-i, --interactive', 'Run interactive mode')
      // .option('--log-level <LEVEL>', `Log level used, default: ${DEFAULT_LOG_LEVEL}`)
      .option('-u, --url <URL>', `URL to connect to, default: ${DEFAULT_URL}/worker`)
      .option('-t, --token <TOKEN>', `Token used for authorization, default: ${DEFAULT_TOKEN}`)
      .option('-a, --url-auth <URL>', `URL used for authentication, default: ${DEFAULT_URL_AUTH}`)
      .option('--username <EMAIL>', 'Username')
      .option('--password <PASSWORD>', 'Password')
      .parse(args);

    // logger.level = program.logLevel || DEFAULT_LOG_LEVEL;

    this._channel = new Channel();
    this._manager = new Manager();

    // Update token if the --username and --password was specified
    this.manager.loadCrawlers().then(
      () => {
        if (program.crawl) {
          const payload = {
            crawler: program.args[0],
            url: program.args[1],
          };

          return crawl(this.manager.crawlers, payload)
            .then(
              (result) => {
                logger.info(JSON.stringify(result, null, 4));
                process.exit(0);
              },
              (error) => {
                logger.error(JSON.stringify(error, null, 4));
                process.exit(0);
              }
            );
        }

        // Get Token - Fetch, Read From File or Return Default
        return updateToken(
          program.username,
          program.password,
          program.urlAuth || DEFAULT_URL_AUTH,
          TOKEN_PATH
        );
      },
      (err) => {
        logger.error('Unable to load crawlers', err);
      }
    ).then(
      (newToken) => {
        const token = newToken || program.token || readToken();
        logger.info(`Using token: ${token}`);
        // Intitialize Channel for Communication with WebApp (Backend)

        const res = [];
        const count = parseInt(program.count, 10) || DEFAULT_WORKERS_COUNT;
        for (let i = 0; i < count; i += 1) {
          res.push(this.channel.initialize(
            program.url || `${DEFAULT_URL}/worker`,
            token,
            program.channel || DEFAULT_CHANNEL,
            this.manager
          ));
        }

        return res;
      },
      (err) => {
        logger.error('Unable to updateToken', err);
      }
    );
  }
}
