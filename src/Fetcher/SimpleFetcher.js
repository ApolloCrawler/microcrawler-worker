/* eslint class-methods-use-this: 0 */
import request from 'superagent';

export default class SimpleFetcher {
  initialize() {
    return Promise.resolve(true);
  }

  get(url) {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .end(
          (err, result) => {
            if (err) {
              return reject(err);
            }

            return resolve({
              text: result.text,
              location: {}
            });
          }
        );
    });
  }
}
