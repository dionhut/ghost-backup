var assert = require('assert');
var handler = require('./index');

describe('Integration Test', function() {
    it('Should succeed', function(done) {
        handler.handler(null, null, done);
    });
});