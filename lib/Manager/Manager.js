'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadCrawlers = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.loadProtocols = loadProtocols;
exports.listPackageJsons = listPackageJsons;
exports.parsePackageJsons = parsePackageJsons;
exports.printCrawlersTable = printCrawlersTable;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _Crawler = require('../Crawler');

var _Crawler2 = _interopRequireDefault(_Crawler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NODE_MODULES = _path2.default.join(__dirname, '..', '..', 'node_modules');

var PROTOCOL_DIR = _path2.default.join(__dirname, '..', 'Protocol');

function loadProtocols() {
  _winston2.default.info(PROTOCOL_DIR);
}

/**
 * List crawlers package.json
 * @param base Folder with installed crawlers - usually node_modules folder
 * @returns {Promise}
 */
function listPackageJsons() {
  var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NODE_MODULES;

  return new Promise(function (resolve, reject) {
    (0, _glob2.default)(base + '/microcrawler-crawler-*/package.json', function (err, paths) {
      if (err) {
        return reject(err);
      }

      return resolve(paths);
    });
  });
}

/**
 * Load Crawlers from their package.json
 * @param paths Array of paths to package.json
 * @returns {Promise}
 */
function parsePackageJsons(paths) {
  return new Promise(function (resolve, reject) {
    if (!paths) {
      return reject('No paths specified!');
    }

    var filtered = _ramda2.default.reject(function (item) {
      return item.includes('microcrawler-crawler-all') || item.includes('microcrawler-crawler-base');
    }, paths);

    var packages = _ramda2.default.map(function (item) {
      var dir = _path2.default.dirname(item);
      return {
        name: _path2.default.basename(dir),
        path: item,
        dir: dir,
        pkg: JSON.parse(_fs2.default.readFileSync(item, 'utf8'))
      };
    }, filtered);

    var crawlers = {};
    _ramda2.default.forEach(function (pkg) {
      var name = pkg.name.replace('microcrawler-crawler-', '');
      var crawler = _Crawler2.default.load(pkg);

      if (crawler) {
        crawlers[name] = crawler;
      } else {
        _winston2.default.error('Unable to load Crawler, name: ' + name);
      }

      crawlers[name] = pkg;
      crawlers[name].processors = {};

      // /*
      _ramda2.default.forEach(function (processor) {
        crawlers[name].processors[processor] = require(_path2.default.join(pkg.dir, pkg.pkg.crawler.processors[processor]));
      }, Object.keys(pkg.pkg.crawler.processors));
      // */
    }, packages);

    return resolve(crawlers);
  });
}

/**
 * Load Crawlers installed in folder
 * @param base Folder with installed crawlers - usually node_modules folder
 */
function _loadCrawlers() {
  var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NODE_MODULES;

  return listPackageJsons(base).then(function (paths) {
    return parsePackageJsons(paths);
  });
}

/**
 * Print Crawlers as CLI Table
 * @param crawlers
 */
exports.loadCrawlers = _loadCrawlers;
function printCrawlersTable(crawlers) {
  var table = new _cliTable2.default({
    head: ['Crawler', 'Processor(s)']
  });

  _ramda2.default.forEach(function (name) {
    var item = crawlers[name];
    table.push([item.name, Object.keys(item.pkg.crawler.processors).join('\n')]);
  }, Object.keys(crawlers));

  console.log(table.toString());
}

/**
 * Crawler Manager
 */

var Manager = function () {
  function Manager() {
    _classCallCheck(this, Manager);

    this._crawlers = {};
  }

  _createClass(Manager, [{
    key: 'loadCrawlers',


    /**
     * Load crawlers
     * @param base Folder with installed crawlers - usually node_modules folder
     * @returns {Promise}
     */
    value: function loadCrawlers() {
      var _this = this;

      var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NODE_MODULES;

      return _loadCrawlers(base).then(function (crawlers) {
        _this._crawlers = crawlers;
        return crawlers;
      });
    }
  }, {
    key: 'crawlers',
    get: function get() {
      return this._crawlers;
    }
  }]);

  return Manager;
}();

exports.default = Manager;