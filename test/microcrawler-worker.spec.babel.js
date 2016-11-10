import {expect} from 'chai';

import App from '../lib';


describe('microcrawler-worker', () => {
  it('should work', () => {
    expect(1 + 1).to.equal(2);
  });
});

describe('Command Line Interface', () => {
  it('accepts', () => {
    const app = new App();
    app.main();
  });
});
