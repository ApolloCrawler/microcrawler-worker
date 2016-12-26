import path from 'path';
import R from 'ramda';

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

    const processors = {};
    R.forEach((key) => {
      const processor = packageJson.pkg.crawler.processors[key];
      const fullProcessorPath = path.join(packageJson.dir, processor);

      processors[key] = require(fullProcessorPath);
    }, Object.keys(packageJson.pkg.crawler.processors));

    crawler._processors = processors;

    return crawler;
  }
}
