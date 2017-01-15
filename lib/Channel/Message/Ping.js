'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PingMessage = function () {
  function PingMessage() {
    _classCallCheck(this, PingMessage);
  }

  _createClass(PingMessage, null, [{
    key: 'construct',
    value: function construct(id) {
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
  }]);

  return PingMessage;
}();

exports.default = PingMessage;