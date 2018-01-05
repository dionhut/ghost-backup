var assert = require('assert');
var handler = require('./index');

describe('Integration Test', () => {
    it('Should succeed', done => {
        handler.handler(null, null, result => {
            done();
        });
    }).timeout(5000);
});