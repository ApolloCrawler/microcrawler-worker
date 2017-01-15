'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _package = require('../../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JoinMessage = function () {
  function JoinMessage() {
    _classCallCheck(this, JoinMessage);
  }

  _createClass(JoinMessage, null, [{
    key: 'construct',
    value: function construct() {
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
  }]);

  return JoinMessage;
}();

exports.default = JoinMessage;