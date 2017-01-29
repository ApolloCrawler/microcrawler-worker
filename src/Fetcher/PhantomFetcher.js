import phantom from 'phantom';
import winston from 'winston';

export default class PhantomFetcher {
  initialize() {
    if (this.instance && this.page) {
      return Promise.resolve(this.page);
    }

    winston.info('Creating new PhantomJS instance');
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
