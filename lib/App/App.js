'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_WORKERS_COUNT = exports.DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_TOKEN = exports.DEFAULT_CHANNEL = exports.DEFAULT_URL_AUTH = exports.DEFAULT_URL = exports.TOKEN = exports.TOKEN_PATH = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // import crypto from 'crypto'; // eslint-disable-line no-unused-vars


exports.configDir = configDir;
exports.readToken = readToken;
exports.updateToken = updateToken;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _xhr = require('xhr2');

var _xhr2 = _interopRequireDefault(_xhr);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _Channel = require('../Channel');

var _Channel2 = _interopRequireDefault(_Channel);

var _Fetcher = require('../Fetcher');

var _Fetcher2 = _interopRequireDefault(_Fetcher);

var _Manager = require('../Manager');

var _Manager2 = _interopRequireDefault(_Manager);

var _crawl = require('../crawl');

var _crawl2 = _interopRequireDefault(_crawl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function configDir() {
  return _path2.default.join(_os2.default.homedir ? _os2.default.homedir() : require('homedir')(), '.microcrawler');
}
var TOKEN_PATH = exports.TOKEN_PATH = _path2.default.join(configDir(), 'token.jwt');

function readToken() {
  var tokenPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : TOKEN_PATH;

  if (_fs2.default.existsSync(tokenPath) === false) {
    return null;
  }

  return _fs2.default.readFileSync(tokenPath).toString().trim();
}

var TOKEN = exports.TOKEN = readToken(TOKEN_PATH);

var DEFAULT_URL = exports.DEFAULT_URL = 'ws://localhost:4000/worker';
var DEFAULT_URL_AUTH = exports.DEFAULT_URL_AUTH = 'http://localhost:4000/api/v1/auth/signin';
var DEFAULT_CHANNEL = exports.DEFAULT_CHANNEL = 'worker:lobby';
var DEFAULT_TOKEN = exports.DEFAULT_TOKEN = TOKEN;
var DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_HEARTBEAT_INTERVAL = 10000;
var DEFAULT_WORKERS_COUNT = exports.DEFAULT_WORKERS_COUNT = 1;

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = _xhr2.default;
global.window = {
  WebSocket: _websocket2.default.w3cwebsocket,
  XMLHttpRequest: _xhr2.default
};

/**
 * Update token
 * @returns {Promise}
 */
function updateToken(username, password, urlAuth, tokenFilePath) {
  return new Promise(function (resolve, reject) {
    if (!username || !password) {
      return resolve(null);
    }

    var payload = {
      email: username,
      password: password
    };

    return _superagent2.default.post(urlAuth).send(payload).end(function (err, result) {
      if (err) {
        return reject(err);
      }

      var jwt = result.body.user.workerJWT;
      console.log('Storing token in ' + tokenFilePath);
      _fs2.default.writeFileSync(tokenFilePath, jwt + '\n');

      return resolve(jwt);
    });
  });
}

var App = function () {
  /**
   * App constructor
   */
  function App() {
    _classCallCheck(this, App);

    this._channel = new _Channel2.default();
    this._manager = new _Manager2.default();

    this.pingFunctionInterval = null;
  }

  /**
   * Get Channel Associated with this App
   * @returns {Channel}
   */


  _createClass(App, [{
    key: 'main',
    value: function main() {
      var _this = this;

      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.argv;

      _commander2.default.version(_package2.default.version).option('-c, --channel <CHANNEL>', 'Channel to connect to, default: ' + DEFAULT_CHANNEL).option('--count <COUNT>', 'Count of workers, default: ' + DEFAULT_WORKERS_COUNT).option('--crawl', 'Crawl single page').option('--heartbeat-interval <MILLISECONDS>', 'Heartbeat interval in milliseconds, default: ' + DEFAULT_HEARTBEAT_INTERVAL).option('-i, --interactive', 'Run interactive mode').option('-u, --url <URL>', 'URL to connect to, default: ' + DEFAULT_URL).option('-t, --token <TOKEN>', 'Token used for authorization, default: ' + DEFAULT_TOKEN).option('-a, --url-auth <URL>', 'URL used for authentication, default: ' + DEFAULT_URL_AUTH).option('--username <EMAIL>', 'Username').option('--password <PASSWORD>', 'Password').parse(args);

      // Update token if the --username and --password was specified
      this.manager.loadCrawlers().then(function () {
        if (_commander2.default.crawl) {
          var fetcher = new _Fetcher2.default();
          var payload = {
            crawler: _commander2.default.args[0],
            url: _commander2.default.args[1]
          };
          return (0, _crawl2.default)(fetcher, _this.manager.crawlers, payload).then(function (result) {
            console.log(JSON.stringify(result, null, 4));
            process.exit(0);
          }, function (error) {
            console.log(JSON.stringify(error, null, 4));
            process.exit(0);
          });
        }

        // Get Token - Fetch, Read From File or Return Default
        return updateToken(_commander2.default.username, _commander2.default.password, _commander2.default.urlAuth || DEFAULT_URL_AUTH, TOKEN_PATH);
      }, function (err) {
        console.log('Unable to load crawlers', err);
      }).then(function (newToken) {
        var token = newToken || _commander2.default.token || readToken();
        console.log('Using token: ' + token);
        // Intitialize Channel for Communication with WebApp (Backend)

        var res = [];
        var count = parseInt(_commander2.default.count, 10) || DEFAULT_WORKERS_COUNT;
        for (var i = 0; i < count; i += 1) {
          res.push(_this.channel.initialize(_commander2.default.url || DEFAULT_URL, token, _commander2.default.channel || DEFAULT_CHANNEL, _this.manager));
        }

        return res;
      }, function (err) {
        console.log('Unable to updateToken', err);
      });
    }
  }, {
    key: 'channel',
    get: function get() {
      return this._channel;
    }

    /**
     * Get Manager Associated with this App
     * @returns {Manager}
     */

  }, {
    key: 'manager',
    get: function get() {
      return this._manager;
    }
  }]);

  return App;
}();

exports.default = App;