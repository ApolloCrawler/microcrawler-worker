import fs from 'fs';
import glob from 'glob';
import path from 'path';
import R from 'ramda';
import Table from 'cli-table';

import Crawler from '../Crawler';

const NODE_MODULES = path.join(__dirname, '..', '..', 'node_modules');

/**
 * List crawlers package.json
 * @param base Folder with installed crawlers - usually node_modules folder
 * @returns {Promise}
 */
export function listPackageJsons(base = NODE_MODULES) {
  return new Promise((resolve, reject) => {
    glob(`${base}/microcrawler-crawler-*/package.json`, (err, paths) => {
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
export function parsePackageJsons(paths, logger) {
  return new Promise((resolve, reject) => {
    if (!paths) {
      return reject('No paths specified!');
    }

    const filtered = R.reject((item) => {
      return item.includes('microcrawler-crawler-all') || item.includes('microcrawler-crawler-base');
    }, paths);

    const packages = R.map((item) => {
      const dir = path.dirname(item);
      return {
        name: path.basename(dir),
        path: item,
        dir,
        pkg: JSON.parse(fs.readFileSync(item, 'utf8'))
      };
    }, filtered);

    const crawlers = {};
    R.forEach((pkg) => {
      const name = pkg.name.replace('microcrawler-crawler-', '');
      const crawler = Crawler.load(pkg);

      if (crawler) {
        crawlers[name] = crawler;
      } else {
        logger.error(`Unable to load Crawler, name: ${name}`);
      }

      crawlers[name] = pkg;
      crawlers[name].processors = {};

      // /*
      R.forEach((processor) => {
        crawlers[name].processors[processor] = crawler.processors[processor];
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
export function loadCrawlers(base = NODE_MODULES, logger) {
  return listPackageJsons(base).then(
    (paths) => {
      return parsePackageJsons(paths, logger);
    }
  );
}

/**
 * Print Crawlers as CLI Table
 * @param crawlers
 */
export function printCrawlersTable(crawlers) {
  const table = new Table({
    head: ['Crawler', 'Processor(s)']
  });

  R.forEach((name) => {
    const item = crawlers[name];
    table.push(
      [
        item.name,
        Object.keys(item.pkg.crawler.processors).join('\n')
      ]
    );
  }, Object.keys(crawlers));

  console.log(table.toString());
}

/**
 * Crawler Manager
 */
export default class Manager {
  constructor(logger) {
    this._crawlers = {};
    this._logger = logger;
  }

  get crawlers() {
    return this._crawlers;
  }

  get logger() {
    return this._logger;
  }

  /**
   * Load crawlers
   * @param base Folder with installed crawlers - usually node_modules folder
   * @returns {Promise}
   */
  loadCrawlers(base = NODE_MODULES) {
    return loadCrawlers(base, this.logger).then(
      (crawlers) => {
        this._crawlers = crawlers;
        return crawlers;
      }
    );
  }
}
