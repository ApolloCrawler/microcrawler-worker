import path from 'path';
import R from 'ramda';
import merge from 'node.extend';

export default class Crawler {
  constructor() {
    this._name = null;
    this._pkg = null;
    this._processors = {};
    this._version = null;
  }

  get name() {
    return this._name;
  }

  get pkg() {
    return this._pkg;
  }

  get version() {
    return this._version;
  }

  get processors() {
    return this._processors;
  }

  static load(packageJson) {
    const crawler = new Crawler();
    crawler._pkg = packageJson;
    crawler._name = packageJson.name;
    crawler._version = packageJson.pkg.version;

    const defaultFetcher = packageJson.pkg.crawler.fetcher || 'simple';
    const processors = {};
    R.forEach((key) => {
      const defaultProcessor = {
        fetcher: defaultFetcher
      };

      const tmp = packageJson.pkg.crawler.processors[key];
      let details = null;
      if (typeof tmp === 'string') {
        details = merge(
          defaultProcessor,
          {
            path: tmp
          }
        );
      } else {
        details = merge(
          defaultProcessor,
          tmp
        );
      }

      const fullProcessorPath = path.join(packageJson.dir, details.path);

      details.processor = require(fullProcessorPath);

      processors[key] = details;
    }, Object.keys(packageJson.pkg.crawler.processors));

    crawler._processors = processors;

    return crawler;
  }
}
