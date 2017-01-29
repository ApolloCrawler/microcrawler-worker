import phantom from 'phantom';
import logger from '../Logger';

export default class PhantomFetcher {
  initialize() {
    if (this.instance && this.page) {
      return Promise.resolve(this.page);
    }

    logger.info('Creating new PhantomJS instance');
    return phantom.create()
      .then(
        (instance) => {
          this.instance = instance;

          return instance.createPage();
        }
      )
      .then((page) => {
        this.page = page;

        // page.on('onResourceRequested', (requestData) => {
        //   console.info('Requesting', requestData.url);
        // });
      })
    ;
  }

  get(url) {
    return new Promise((resolve) => {
      this.page.open(url)
        .then((/* status */) => {
          // console.log(status);

          return this.page.property('content');
        })
        .then(
          (content) => {
            // console.log(content);

            resolve({
              text: content
            });
          }
        );
    });
  }
}
