'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocketLogger = function (_winston$Transport) {
  _inherits(WebSocketLogger, _winston$Transport);

  function WebSocketLogger(options) {
    _classCallCheck(this, WebSocketLogger);

    //
    // Name this logger
    //
    var _this = _possibleConstructorReturn(this, (WebSocketLogger.__proto__ || Object.getPrototypeOf(WebSocketLogger)).call(this, options));

    _this.name = 'webSocketLogger';

    //
    // Set the level from your options
    //
    _this.level = options && options.level || 'info';

    //
    // Configure your storage backing as you see fit
    //
    return _this;
  }

  /* eslint-disable class-methods-use-this */


  _createClass(WebSocketLogger, [{
    key: 'log',
    value: function log(level, msg, meta, callback) {
      console.log('WebSocketLogger', level, msg, meta);

      //
      // Store this message and metadata, maybe use some custom logic
      // then callback indicating success.
      //
      callback(null, true);
    }
    /* eslint-enable class-methods-use-this */

  }]);

  return WebSocketLogger;
}(_winston2.default.Transport);

_winston2.default.transports.WebSocketLogger = WebSocketLogger;

exports.default = WebSocketLogger;