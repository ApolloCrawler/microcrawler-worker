import {expect} from 'chai';

import App from '../../lib/App';

describe('Application', () => {
  it('Is defined', () => {
    const app = new App();
    expect(app).to.not.equal(null);
  });
});
