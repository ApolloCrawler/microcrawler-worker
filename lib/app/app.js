'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_URL = undefined;

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

      _commander2.default.version(_package2.default.version).option('-u, --url <URL>', 'URL to connect to, default: ' + DEFAULT_URL).parse(args);

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

      // Create channel
      var channel = socket.channel("worker:lobby", { token: null });
      channel.join().receive('ok', function (data) {
        console.log("catching up", data);
      }).receive('error', function (_ref) {
        var reason = _ref.reason;

        console.log("failed join", reason);
      }).receive('timeout', function () {
        console.log("Networking issue. Still waiting...");
      });

      channel.push({ msg: "test" });
    }
  }]);

  return App;
}();

exports.default = App;
;