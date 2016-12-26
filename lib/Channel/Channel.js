'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import urlparser from 'url';

exports.createChannel = createChannel;
exports.pingFunction = pingFunction;
exports.createSocket = createSocket;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _phoenixSocket = require('phoenix-socket');

var _Fetcher = require('../Fetcher');

var _Fetcher2 = _interopRequireDefault(_Fetcher);

var _Ok = require('./Event/Ok');

var _Ok2 = _interopRequireDefault(_Ok);

var _Error = require('./Event/Error');

var _Error2 = _interopRequireDefault(_Error);

var _Timeout = require('./Event/Timeout');

var _Timeout2 = _interopRequireDefault(_Timeout);

var _Join = require('./Message/Join');

var _Join2 = _interopRequireDefault(_Join);

var _Ping = require('./Message/Ping');

var _Ping2 = _interopRequireDefault(_Ping);

var _Pong = require('./Handler/Pong');

var _Pong2 = _interopRequireDefault(_Pong);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Create new channel
 * @param socket Socket to be used for creating channel
 * @param channelName Name of channel to be joined to
 * @param registerPingFunction Function used for registering ping function - callback
 * @param unregisterPingFunction Function used for unregistering ping function - callback
 */
function createChannel(socket, channelName, registerPingFunction, unregisterPingFunction, crawlers) {
  var channel = socket.channel(channelName, _Join2.default.construct());

  var event = channel.join();

  event = _Ok2.default.register(event, function () {
    registerPingFunction(channel);
  });

  event = _Error2.default.register(event, unregisterPingFunction, function () {
    unregisterPingFunction();
  });

  /* event = */_Timeout2.default.register(event);

  channel.on('crawl', function (data) {
    console.log('Received event - crawl');

    var payload = null;
    try {
      payload = JSON.parse(data.payload);
    } catch (e) {
      var msg = 'Parsing JSON failed, reason: ' + e + ', json: ' + data.payload;
      console.log(msg);

      return channel.push('done', {
        error: msg
      });
    }

    console.log(JSON.stringify(payload, null, 4));

    // const url = urlparser.parse(payload.url);
    // console.log(url);

    var parts = (payload.crawler || payload.processor).split('/');
    var crawlerName = parts[0];
    var processorName = parts[1] || 'index';

    var crawler = crawlers[crawlerName.replace('microcrawler-crawler-', '')];
    if (!crawler) {
      var _msg = 'Unable to find crawler named: \'' + crawlerName + '\'';
      console.log(_msg);

      return channel.push('done', {
        error: _msg
      });
    }

    var processor = crawler.processors && crawler.processors[processorName];
    if (!processor) {
      var _msg2 = 'Unable to find processor named: \'' + processorName + '\'';
      console.log(_msg2);

      return channel.push('done', {
        error: _msg2
      });
    }

    return _Fetcher2.default.get(payload.url).then(function (result) {
      var text = result.text;
      var doc = _cheerio2.default.load(text);

      var response = processor(doc, payload);
      console.log(JSON.stringify(response, null, 4));

      return channel.push('done', response);
    }, function (err) {
      return channel.push('done', {
        error: err
      });
    });
  });

  _Pong2.default.register(channel);

  channel.push('msg', { msg: 'Hello World!' });
}

/**
 * Send ping function to channel
 * @param channel Channel to send the message to
 * @param id ID of the message
 */
function pingFunction(channel, id) {
  console.log('Executing ping function.');
  channel.push('ping', _Ping2.default.construct(id));
}

/**
 * Create socket
 * @param url - URL to be connected to
 * @param token - jwt for worker authentication
 * @param unregisterPingFunction
 * @returns {Socket}
 */
function createSocket(url, token, unregisterPingFunction) {
  console.log('Connecting to "' + url + '"');
  var socket = new _phoenixSocket.Socket(url, {
    params: {
      guardian_token: token
    },
    transport: global.window.WebSocket
  });

  // Error handler
  socket.onError(function (err) {
    console.log('There was an error with the connection!');
    console.log(err);
    unregisterPingFunction();
  });

  // Close handler
  socket.onClose(function () {
    console.log('The connection dropped.');
    unregisterPingFunction();
  });

  return socket;
}

/**
 * Channel (Websocket) used for communication with Webapp (Backend)
 */

var Channel = function () {
  function Channel() {
    _classCallCheck(this, Channel);

    console.log('Loading Supported Protocols');
  }

  /**
   * Register ping function
   * @param channel Channel to be used by ping fuction
   * @param heartbeatInterval Interval between pings
   */


  _createClass(Channel, [{
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

    /**
     * Initialize Channel
     * @param url Webapp Socket URL
     * @param token Auth Token
     * @param channelName Name of Channel used for Communication
     * @param manager Crawler Manager
     * @returns {Promise}
     */

  }, {
    key: 'initialize',
    value: function initialize(url, token, channelName, manager) {
      var _this = this;

      var crawlers = manager.crawlers;

      return new Promise(function (resolve) {
        var socket = createSocket(url, token, _this.unregisterPingFunction.bind(_this));

        // Try to connect
        socket.connect();

        // const channel =
        createChannel(socket, channelName, _this.registerPingFunction.bind(_this), _this.unregisterPingFunction.bind(_this), crawlers);

        resolve(_this);
      });
    }
  }]);

  return Channel;
}();

exports.default = Channel;