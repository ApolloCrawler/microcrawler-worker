'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint class-methods-use-this: 0 */


var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SimpleFetcher = function () {
  function SimpleFetcher() {
    _classCallCheck(this, SimpleFetcher);
  }

  _createClass(SimpleFetcher, [{
    key: 'initialize',
    value: function initialize() {
      return Promise.resolve(true);
    }
  }, {
    key: 'get',
    value: function get(url) {
      return new Promise(function (resolve, reject) {
        _superagent2.default.get(url).end(function (err, result) {
          if (err) {
            return reject(err);
          }

          return resolve({
            text: result.text,
            location: {}
          });
        });
      });
    }
  }]);

  return SimpleFetcher;
}();

exports.default = SimpleFetcher;