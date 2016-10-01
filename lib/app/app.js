'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_TOKEN = exports.DEFAULT_CHANNEL = exports.DEFAULT_URL = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _phoenixSocket = require('phoenix-socket');

var _websocket = require('websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _xhr = require('xhr2');

var _xhr2 = _interopRequireDefault(_xhr);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_URL = exports.DEFAULT_URL = 'ws://localhost:4000/socket';
var DEFAULT_CHANNEL = exports.DEFAULT_CHANNEL = 'worker:lobby';
var DEFAULT_TOKEN = exports.DEFAULT_TOKEN = null;
var DEFAULT_HEARTBEAT_INTERVAL = exports.DEFAULT_HEARTBEAT_INTERVAL = 10000;

// These hacks are required to pretend we are the browser
global.XMLHttpRequest = _xhr2.default;
global.window = {
  WebSocket: _websocket2.default.w3cwebsocket,
  XMLHttpRequest: _xhr2.default
};

var App = function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'main',
    value: function main() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.argv;

      _commander2.default.version(_package2.default.version).option('-c, --channel <CHANNEL>', 'Channel to connect to, default: ' + DEFAULT_CHANNEL).option('--heartbeat-interval <MILLISECONDS>', 'Heartbeat interval in milliseconds, default: ' + DEFAULT_HEARTBEAT_INTERVAL).option('-u, --url <URL>', 'URL to connect to, default: ' + DEFAULT_URL).option('-t, --token <TOKEN>', 'Token used for authorization, default: ' + DEFAULT_TOKEN).parse(args);

      var url = _commander2.default.url || DEFAULT_URL;

      console.log('Connecting to "' + url + '"');
      var socket = new _phoenixSocket.Socket(url, { transport: global.window.WebSocket });

      // Error handler
      socket.onError(function (err) {
        console.log('There was an error with the connection!');
        console.log(err);
      });

      // Close handler
      socket.onClose(function () {
        console.log('The connection dropped.');
      });

      // Try to connect
      socket.connect();

      var channelName = _commander2.default.channel || DEFAULT_CHANNEL;

      // Create channel
      var token = _commander2.default.token || DEFAULT_TOKEN;
      var channel = socket.channel(channelName, { token: token });
      var r = channel.join().receive('ok', function (payload) {
        console.log("Received ok");
        console.log(JSON.stringify(payload, null, 4));
      }).receive('error', function (_ref) {
        var reason = _ref.reason;

        console.log("Failed join", reason);
      }).receive('timeout', function () {
        console.log("Networking issue. Still waiting...");
      });

      channel.on('pong', function (payload) {
        console.log('Received event - pong');
        console.log(JSON.stringify(payload, null, 4));
      });

      var heartbeatInterval = _commander2.default.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL;
      var id = 0;
      setInterval(function () {
        channel.push('ping', { id: id, msg: 'I am still alive!', name: _package2.default.name, version: _package2.default.version });
        id += 1;
      }, parseInt(heartbeatInterval));

      channel.push('msg', { msg: 'Hello World!' });
    }
  }]);

  return App;
}();

exports.default = App;
;