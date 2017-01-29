'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ErrorEvent = function () {
  function ErrorEvent() {
    _classCallCheck(this, ErrorEvent);
  }

  _createClass(ErrorEvent, null, [{
    key: 'register',
    value: function register(event, func) {
      event.receive('error', function (_ref) {
        var reason = _ref.reason;

        _Logger2.default.error('Failed join', reason);

        if (func) {
          func();
        }
      });

      return event;
    }
  }]);

  return ErrorEvent;
}();

exports.default = ErrorEvent;