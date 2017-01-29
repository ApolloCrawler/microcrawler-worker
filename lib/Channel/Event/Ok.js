'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OkEvent = function () {
  function OkEvent() {
    _classCallCheck(this, OkEvent);
  }

  _createClass(OkEvent, null, [{
    key: 'register',
    value: function register(event, func) {
      event.receive('ok', function (payload) {
        _winston2.default.info('Received ok');
        _winston2.default.info(JSON.stringify(payload, null, 4));

        if (func) {
          func();
        }
      });

      return event;
    }
  }]);

  return OkEvent;
}();

exports.default = OkEvent;