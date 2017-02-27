import cheerio from 'cheerio';
import logger from './Logger';

import {Simple, Phantom} from './Fetcher';

const fetchers = {
  simple: new Simple(),
  phantom: new Phantom()
};

export default function crawl(crawlers, payload) {
  const parts = (payload.crawler || payload.processor).split('/');
  const crawlerName = parts[0].replace('microcrawler-crawler-', '');
  const processorName = parts[1] || 'index';

  return new Promise((resolve, reject) => {
    const crawler = crawlers[crawlerName];
    if (!crawler) {
      const msg = `Unable to find crawler named: '${crawlerName}'`;
      logger.error(msg);

      return reject({
        error: msg
      });
    }

    const processor = crawler.processors && crawler.processors[processorName];
    if (!processor) {
      const msg = `Unable to find processor named: '${processorName}'`;
      logger.error(msg);

      return reject({
        error: msg
      });
    }

    const fetcher = fetchers[processor.fetcher];

    return fetcher.initialize()
      .then(() => {
        fetcher.get(payload.url).then(
          (result) => {
            const text = result.text;
            const doc = cheerio.load(text);

            const response = {
              request: payload,
              results: processor.processor(
                doc,
                payload,
                {
                  location: JSON.parse(JSON.stringify(result.location))
                }
              )
            };

            logger.info(JSON.stringify(response, null, 4));

            return resolve(response);
          },
          (err) => {
            return reject({
              error: err
            });
          }
        );
      });
  });
}
