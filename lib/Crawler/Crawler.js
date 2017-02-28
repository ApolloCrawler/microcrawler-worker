'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _node = require('node.extend');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Crawler = function () {
  function Crawler() {
    _classCallCheck(this, Crawler);

    this._name = null;
    this._pkg = null;
    this._processors = {};
    this._version = null;
  }

  _createClass(Crawler, [{
    key: 'name',
    get: function get() {
      return this._name;
    }
  }, {
    key: 'pkg',
    get: function get() {
      return this._pkg;
    }
  }, {
    key: 'version',
    get: function get() {
      return this._version;
    }
  }, {
    key: 'processors',
    get: function get() {
      return this._processors;
    }
  }], [{
    key: 'load',
    value: function load(packageJson) {
      var crawler = new Crawler();
      crawler._pkg = packageJson;
      crawler._name = packageJson.name;
      crawler._version = packageJson.pkg.version;

      var defaultFetcher = packageJson.pkg.crawler.fetcher || 'simple';
      var processors = {};
      _ramda2.default.forEach(function (key) {
        var defaultProcessor = {
          fetcher: defaultFetcher
        };

        var tmp = packageJson.pkg.crawler.processors[key];
        var details = null;
        if (typeof tmp === 'string') {
          details = (0, _node2.default)(defaultProcessor, {
            path: tmp
          });
        } else {
          details = (0, _node2.default)(defaultProcessor, tmp);
        }

        var fullProcessorPath = _path2.default.join(packageJson.dir, details.path);

        details.processor = require(fullProcessorPath);

        processors[key] = details;
      }, Object.keys(packageJson.pkg.crawler.processors));

      crawler._processors = processors;

      return crawler;
    }
  }]);

  return Crawler;
}();

exports.default = Crawler;