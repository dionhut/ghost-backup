var Promise = require('bluebird');
var assert = require('chai').assert;
var handler = require('../index');

describe('Lambda Handler Tests', () => {
    it('Should fail with GHOST_URL not defined', (done) => {
        var _config = {
            key1: 'val1'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env GHOST_URL not defined");
            done();
        }, null, _config);
    });

    it('Should fail with CLIENT_ID not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env CLIENT_ID not defined");
            done();
        }, null, _config);
    });

    it('Should fail with SECRET not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: ''
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env SECRET not defined");
            done();
        }, null, _config);
    });

    it('Should fail with USERNAME not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env USERNAME not defined");
            done();
        }, null, _config);
    });

    it('Should fail with PASSWORD not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env PASSWORD not defined");
            done();
        }, null, _config);
    });

    it('Should fail with S3_BUCKET not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env S3_BUCKET not defined");
            done();
        }, null, _config);
    });

    it('Should fail with S3_KEY not defined', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-backup'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Env S3_KEY not defined");
            done();
        }, null, _config);
    });

    it('Should fail with reject', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, "Failed");
            done();
        }, (config, requestHandler, s3Client) => {
            assert.deepEqual(_config, config);
            assert.notEqual(requestHandler, null);
            assert.notEqual(s3Client, null);
            return new Promise((resolve, reject) => {
                reject();
            });
        }, _config);
    });

    it('Should succeed with resolve', (done) => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        handler.handler({ event: 'event1'}, { context: 'context_'}, (result) => {
            // callback
            assert.equal(result, null);
            done();
        }, (config, requestHandler, s3Client) => {
            assert.deepEqual(_config, config);
            assert.notEqual(requestHandler, null);
            assert.notEqual(s3Client, null);
            return new Promise((resolve, reject) => {
                resolve();
            });
        }, _config);
    });
});

describe('BackupGhostBlog Handler Tests', () => {
    it('Should succeed with all resolved', done => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        var backupData = JSON.stringify({
            key1: 'val1',
            key2: 'val2'
        });

        handler.backupGhostBlog(_config, { post: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/authentication/token");
                assert.equal(options.form.grant_type,'password');
                assert.equal(options.form.client_id,'11111');
                assert.equal(options.form.client_secret,'xxxxx');
                assert.equal(options.form.username,'joeblogs');
                assert.equal(options.form.password,'&^%#@');
                resolve(JSON.stringify({ access_token: 'xxxx.yyyy.zzz' }));
            });
        }, get: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/db");
                assert.equal(options.headers.Authorization,'Bearer xxxx.yyyy.zzz');
                resolve(backupData);
            });
        }}, { putObject: options => {
            return { promise: () => {
                return new Promise((resolve, reject) => {
                    assert.equal(options.Bucket, "my-ghost-blog");
                    assert.match(options.Key, /backup\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2}.json/);
                    assert.equal(options.Body, backupData);
                    resolve();
                });
            }};
        }}).then(() => {
            done();
        });
    });

    it('Should fail with s3 reject', done => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        var backupData = JSON.stringify({
            key1: 'val1',
            key2: 'val2'
        });

        handler.backupGhostBlog(_config, { post: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/authentication/token");
                assert.equal(options.form.grant_type,'password');
                assert.equal(options.form.client_id,'11111');
                assert.equal(options.form.client_secret,'xxxxx');
                assert.equal(options.form.username,'joeblogs');
                assert.equal(options.form.password,'&^%#@');
                resolve(JSON.stringify({ access_token: 'xxxx.yyyy.zzz' }));
            });
        }, get: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/db");
                assert.equal(options.headers.Authorization,'Bearer xxxx.yyyy.zzz');
                resolve(backupData);
            });
        }}, { putObject: options => {
            return { promise: () => {
                return new Promise((resolve, reject) => {
                    assert.equal(options.Bucket, "my-ghost-blog");
                    assert.match(options.Key, /backup\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2}.json/);
                    assert.equal(options.Body, backupData);
                    reject("S3-FAILED");
                });
            }};
        }}).catch(error => {
            assert.equal(error, "S3-FAILED");
            done();
        });
    });

    it('Should fail with ghost db call reject', done => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        handler.backupGhostBlog(_config, { post: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/authentication/token");
                assert.equal(options.form.grant_type,'password');
                assert.equal(options.form.client_id,'11111');
                assert.equal(options.form.client_secret,'xxxxx');
                assert.equal(options.form.username,'joeblogs');
                assert.equal(options.form.password,'&^%#@');
                resolve(JSON.stringify({ access_token: 'xxxx.yyyy.zzz' }));
            });
        }, get: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/db");
                assert.equal(options.headers.Authorization,'Bearer xxxx.yyyy.zzz');
                reject("GHOST_DB_FAILED");
            });
        }}, null).catch(error => {
            assert.equal(error, "GHOST_DB_FAILED");
            done();
        });
    });

    it('Should fail with ghost token call reject', done => {
        var _config = {
            ghostUrl: 'https://sdfsdf',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        handler.backupGhostBlog(_config, { post: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/authentication/token");
                assert.equal(options.form.grant_type,'password');
                assert.equal(options.form.client_id,'11111');
                assert.equal(options.form.client_secret,'xxxxx');
                assert.equal(options.form.username,'joeblogs');
                assert.equal(options.form.password,'&^%#@');
                reject("403");
            });
        }}, null).catch(error => {
            assert.equal(error, "403");
            done();
        });
    });

    it('Should check base url trailing slash', done => {
        var _config = {
            ghostUrl: 'https://sdfsdf/',
            clientId: '11111',
            secret: 'xxxxx',
            username: 'joeblogs',
            password: '&^%#@',
            s3Bucket: 'my-ghost-blog',
            s3Key: 'backup'
        };

        handler.backupGhostBlog(_config, { post: (url, options) => {
            return new Promise((resolve, reject) => {
                assert.equal(url, "https://sdfsdf/authentication/token");
                assert.equal(options.form.grant_type,'password');
                assert.equal(options.form.client_id,'11111');
                assert.equal(options.form.client_secret,'xxxxx');
                assert.equal(options.form.username,'joeblogs');
                assert.equal(options.form.password,'&^%#@');
                reject("403");
            });
        }}, null).catch(error => {
            assert.equal(error, "403");
            done();
        });
    });
});