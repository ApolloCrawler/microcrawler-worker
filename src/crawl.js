import cheerio from 'cheerio';

export default function crawl(fetcher, crawlers, payload) {
  const parts = (payload.crawler || payload.processor).split('/');
  const crawlerName = parts[0].replace('microcrawler-crawler-', '');
  const processorName = parts[1] || 'index';

  return new Promise((resolve, reject) => {
    const crawler = crawlers[crawlerName];
    if (!crawler) {
      const msg = `Unable to find crawler named: '${crawlerName}'`;
      console.log(msg);

      return reject({
        error: msg
      });
    }

    const processor = crawler.processors && crawler.processors[processorName];
    if (!processor) {
      const msg = `Unable to find processor named: '${processorName}'`;
      console.log(msg);

      return reject({
        error: msg
      });
    }

    return fetcher.initialize()
      .then(() => {
        fetcher.get(payload.url).then(
          (result) => {
            const text = result.text;
            const doc = cheerio.load(text);

            const response = {
              request: payload,
              results: processor(doc, payload)
            };

            console.log(JSON.stringify(response, null, 4));

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
