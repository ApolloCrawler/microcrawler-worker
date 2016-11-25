'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.constructJoinMessage = constructJoinMessage;
exports.constructPingMessage = constructPingMessage;
exports.createChannel = createChannel;
exports.pingFunction = pingFunction;
exports.createSocket = createSocket;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _phoenixSocket = require('phoenix-socket');

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Construct message which is send during joining the channel
 * @returns {{uuid: *, name, version, os: {cpus: *, endian: *, hostname: *, platform: *, uptime: *, mem: {total: *, free: *}, load: *}}}
 */
function constructJoinMessage() {
  return {
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
 * @param registerPingFunction Function used for registering ping function - callback
 * @param unregisterPingFunction Function used for unregistering ping function - callback
 */
function createChannel(socket, channelName, registerPingFunction, unregisterPingFunction, crawlers) {
  var channel = socket.channel(channelName, constructJoinMessage());

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

  channel.on('crawl', function (data) {
    console.log('Received event - crawl');

    var payload = null;
    try {
      payload = JSON.parse(data.payload);
    } catch (e) {
      console.log('Parsing JSON failed, reason: ' + e, e, data.payload);
    }

    console.log(JSON.stringify(payload, null, 4));

    _superagent2.default.get(payload.url).end(function (err, result) {
      if (err) {
        return channel.push('done', {
          error: err
        });
      }

      var text = result.text;
      var doc = _cheerio2.default.load(text);

      var crawler = crawlers[payload.crawler] || {};
      console.log(crawler);
      if (crawler === {}) {
        console.log('Unable to find crawler named: \'' + payload.crawler + '\'');
      }

      var processor = crawler.processors && crawler.processors[payload.processor];
      if (processor) {
        var response = processor(doc, payload);
        console.log(JSON.stringify(response, null, 4));

        return channel.push('done', response);
      }

      console.log('Unable to find processor named: \'' + payload.processor + '\'');

      return channel.push('done', {
        error: 'crawler/processor not found'
      });
    });
  });

  channel.on('pong', function (payload) {
    console.log('Received event - pong');
    console.log(JSON.stringify(payload, null, 4));
  });

  channel.push('msg', { msg: 'Hello World!' });
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
    params: { guardian_token: token },
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

var Channel = function () {
  function Channel() {
    _classCallCheck(this, Channel);
  }

  _createClass(Channel, [{
    key: 'registerPingFunction',

    /**
     * Register ping function
     * @param channel Channel to be used by ping fuction
     * @param heartbeatInterval Interval between pings
     */
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