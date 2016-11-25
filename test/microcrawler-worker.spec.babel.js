import {expect} from 'chai';

import App from '../lib/App';
import Manager from '../lib/Manager';

describe('Application', () => {
  it('Is defined', () => {
    const app = new App();
    expect(app).to.not.equal(null);
  });
});

describe('Manager', () => {
  it('Is defined', () => {
    const app = new Manager();
    expect(app).to.not.equal(null);
  });
});
