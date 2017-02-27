'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = crawl;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Fetcher = require('./Fetcher');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchers = {
  simple: new _Fetcher.Simple(),
  phantom: new _Fetcher.Phantom()
};

function crawl(crawlers, payload) {
  var parts = (payload.crawler || payload.processor).split('/');
  var crawlerName = parts[0].replace('microcrawler-crawler-', '');
  var processorName = parts[1] || 'index';

  return new Promise(function (resolve, reject) {
    var crawler = crawlers[crawlerName];
    if (!crawler) {
      var msg = 'Unable to find crawler named: \'' + crawlerName + '\'';
      _Logger2.default.error(msg);

      return reject({
        error: msg
      });
    }

    var processor = crawler.processors && crawler.processors[processorName];
    if (!processor) {
      var _msg = 'Unable to find processor named: \'' + processorName + '\'';
      _Logger2.default.error(_msg);

      return reject({
        error: _msg
      });
    }

    var fetcher = fetchers[processor.fetcher];

    return fetcher.initialize().then(function () {
      fetcher.get(payload.url).then(function (result) {
        var text = result.text;
        var doc = _cheerio2.default.load(text);

        var response = {
          request: payload,
          results: processor.processor(doc, payload, {
            location: JSON.parse(JSON.stringify(result.location))
          })
        };

        _Logger2.default.info(JSON.stringify(response, null, 4));

        return resolve(response);
      }, function (err) {
        return reject({
          error: err
        });
      });
    });
  });
}