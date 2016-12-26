import request from 'superagent';

export default class Fetcher {
  static get(url) {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .end(
          (err, result) => {
            if (err) {
              return reject(err);
            }

            return resolve(result);
          }
        );
    });
  }
}
