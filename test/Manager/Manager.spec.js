import {expect} from 'chai';

import Manager from '../../lib/Manager';

describe('Manager', () => {
  it('Is defined', () => {
    const manager = new Manager();
    expect(manager).to.not.equal(null);
  });
});
