'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_TOKEN = exports.DEFAULT_CHANNEL = exports.DEFAULT_URL_AUTH = exports.DEFAULT_URL = exports.TOKEN = exports.TOKEN_PATH = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.configDir = configDir;
exports.constructJoinMessage = constructJoinMessage;
exports.constructPingMessage = constructPingMessage;
exports.createChannel = createChannel;
exports.createSocket = createSocket;
exports.pingFunction = pingFunction;

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

var _phoenixSocket = require('phoenix-socket');

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _xhr = require('xhr2');

var _xhr2 = _interopRequireDefault(_xhr);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function configDir() {
  return _path2.default.join(_os2.default.homedir ? _os2.default.homedir() : require('homedir')(), '.microcrawler');
}

var TOKEN_PATH = exports.TOKEN_PATH = _path2.default.join(configDir(), 'token.jwt');

var TOKEN = exports.TOKEN = function (tokenPath) {
  if (_fs2.default.existsSync(tokenPath) === false) {
    return null;
  }

  return _fs2.default.readFileSync(tokenPath).toString().trim();
}(TOKEN_PATH);

var DEFAULT_URL = exports.DEFAULT_URL = 'ws://localhost:4000/socket';
var DEFAULT_URL_AUTH = exports.DEFAULT_URL_AUTH = 'http://localhost:4000/api/v1/auth/signin';
var DEFAULT_CHANNEL = exports.DEFAULT_CHANNEL = 'worker:lobby';
var DEFAULT_TOKEN = exports.DEFAULT_TOKEN = TOKEN;
var DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_HEARTBEAT_INTERVAL = 10000;

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = _xhr2.default;
global.window = {
  WebSocket: _websocket2.default.w3cwebsocket,
  XMLHttpRequest: _xhr2.default
};

/**
 * Construct message which is send during joining the channel
 * @param token Optional token
 * @returns {{token: *, uuid: *, name, version, os: {cpus: *, endian: *, hostname: *, platform: *, uptime: *, mem: {total: *, free: *}, load: *}}}
 */
function constructJoinMessage() {
  var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  return {
    token: token,
    uuid: _nodeUuid2.default.v4(),
    name: _package2.default.name,
    version: _package2.default.version,
    os: {
      cpus: _os2.default.cpus(),
      endian: _os2.default.endianness(),
      hostname: _os2.default.hostname(),
      platform: _os2.default.platform(),
      uptime: _os2.default.uptime(),
      mem: {
        total: _os2.default.totalmem(),
        free: _os2.default.freemem()
      },
      load: _os2.default.loadavg()
    }
  };
}

/**
 * Construct ping message
 * @param id ID of the message to be send
 * @returns {{id: *, msg: string, os: {mem: {total: *, free: *}, load: *, uptime: *}}}
 */
function constructPingMessage(id) {
  return {
    id: id,
    msg: 'I am still alive!',
    os: {
      mem: {
        total: _os2.default.totalmem(),
        free: _os2.default.freemem()
      },
      load: _os2.default.loadavg(),
      uptime: _os2.default.uptime()
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
function createChannel(socket, channelName, token, registerPingFunction, unregisterPingFunction) {
  var channel = socket.channel(channelName, constructJoinMessage(token));

  /* const _channel = */
  channel.join().receive('ok', function (payload) {
    console.log('Received ok');
    console.log(JSON.stringify(payload, null, 4));
    registerPingFunction(channel);
  }).receive('error', function (_ref) {
    var reason = _ref.reason;

    console.log('Failed join', reason);
    unregisterPingFunction();
  }).receive('timeout', function () {
    console.log('Networking issue. Still waiting...');
  });

  channel.on('crawl', function (payload) {
    console.log('Received event - crawl');
    console.log(JSON.stringify(payload, null, 4));
    // simulate some work
    var workDuration = (JSON.stringify(payload, null, 4).split('.').length - 1) * 1000;
    var work = function work() {
      var msg = {
        done: payload
      };
      channel.push('done', msg);
    };
    setTimeout(work, workDuration);
  });

  channel.on('pong', function (payload) {
    console.log('Received event - pong');
    console.log(JSON.stringify(payload, null, 4));
  });

  channel.push('msg', { msg: 'Hello World!' });
}

/**
 * Create socket
 * @param url - URL to be connected to
 * @param unregisterPingFunction
 * @returns {Socket}
 */
function createSocket(url, unregisterPingFunction) {
  console.log('Connecting to "' + url + '"');
  var socket = new _phoenixSocket.Socket(url, {
    transport: global.window.WebSocket
  });

  // Error handler
  socket.onError(function (err) {
    console.log('There was an error with the connection!');
    unregisterPingFunction();
    console.log(err);
  });

  // Close handler
  socket.onClose(function () {
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
function pingFunction(channel, id) {
  console.log('Executing ping function.');
  channel.push('ping', constructPingMessage(id));
}

var App = function () {
  function App() {
    _classCallCheck(this, App);

    this.pingFunctionInterval = null;
  }

  /**
   * Register ping function
   * @param channel Channel to be used by ping fuction
   * @param heartbeatInterval Interval between pings
   */


  _createClass(App, [{
    key: 'registerPingFunction',
    value: function registerPingFunction(channel) {
      var heartbeatInterval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;

      console.log('Registering ping function.');

      var id = 0;
      this.pingFunctionInterval = setInterval(function () {
        pingFunction(channel, id);
        id += 1;
      }, heartbeatInterval);
    }

    /**
     * Unegister ping function
     */

  }, {
    key: 'unregisterPingFunction',
    value: function unregisterPingFunction() {
      if (this.pingFunctionInterval) {
        console.log('Unregistering ping function.');
        clearInterval(this.pingFunctionInterval);
        this.pingFunctionInterval = null;
      }
    }
  }, {
    key: 'main',
    value: function main() {
      var _this = this;

      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.argv;

      _commander2.default.version(_package2.default.version).option('-c, --channel <CHANNEL>', 'Channel to connect to, default: ' + DEFAULT_CHANNEL).option('--heartbeat-interval <MILLISECONDS>', 'Heartbeat interval in milliseconds, default: ' + DEFAULT_HEARTBEAT_INTERVAL).option('-i, --interactive', 'Run interactive mode').option('-u, --url <URL>', 'URL to connect to, default: ' + DEFAULT_URL).option('-t, --token <TOKEN>', 'Token used for authorization, default: ' + DEFAULT_TOKEN).option('-a, --url-auth <URL>', 'URL used for authentication, default: ' + DEFAULT_URL_AUTH).option('--username <EMAIL>', 'Username').option('--password <PASSWORD>', 'Password').parse(args);

      var promise = Promise.resolve(true);

      var urlAuth = _commander2.default.urlAuth || DEFAULT_URL_AUTH;
      var username = _commander2.default.username;
      var password = _commander2.default.password;
      if (username && password) {
        (function () {
          var payload = {
            email: username,
            password: password
          };

          promise = new Promise(function (resolve, reject) {
            _superagent2.default.post(urlAuth).send(payload).end(function (err, result) {
              if (err) {
                return reject(err);
              }

              return resolve(result);
            });
          });

          promise.then(function (result) {
            var jwt = result.body.jwt;
            console.log('Storing token in ' + TOKEN_PATH);
            _fs2.default.writeFileSync(TOKEN_PATH, jwt + '\n');
          }, function (error) {
            console.log(error);
          });
        })();
      }

      promise.then(function () {
        // Create socket
        var url = _commander2.default.url || DEFAULT_URL;
        var socket = createSocket(url, _this.unregisterPingFunction.bind(_this));

        // Try to connect
        socket.connect();

        // Create channel
        var channelName = _commander2.default.channel || DEFAULT_CHANNEL;
        var token = _commander2.default.token || DEFAULT_TOKEN;

        /* const channel = */createChannel(socket, channelName, token, _this.registerPingFunction.bind(_this), _this.unregisterPingFunction.bind(_this));
      });
    }
  }]);

  return App;
}();

exports.default = App;