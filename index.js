var request = require('request-promise');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var moment = require('moment');

exports.handler = function(event, context, callback, injectHandler, config) {
    console.log('event', event);
    console.log('context', context);

    injectHandler = injectHandler || backupGhostBlog;
    config = config || {
        ghostUrl: process.env.GHOST_URL,
        clientId: process.env.CLIENT_ID,
        secret: process.env.SECRET,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        s3Bucket: process.env.S3_BUCKET,
        s3Key: process.env.S3_KEY
    }

    if(!config.ghostUrl || config.ghostUrl.length == 0) {
        callback("Env GHOST_URL not defined");
        return;
    }
    if(!config.clientId || config.clientId.length == 0) {
        callback("Env CLIENT_ID not defined");
        return;
    }
    if(!config.secret || config.secret.length == 0) {
        callback("Env SECRET not defined");
        return;
    }
    if(!config.username || config.username.length == 0) {
        callback("Env USERNAME not defined");
        return;
    }
    if(!config.password || config.password.length == 0) {
        callback("Env PASSWORD not defined");
        return;
    }
    if(!config.s3Bucket || config.s3Bucket.length == 0) {
        callback("Env S3_BUCKET not defined");
        return;
    }
    if(!config.s3Key || config.s3Key.length == 0) {
        callback("Env S3_KEY not defined");
        return;
    }

    injectHandler(config, request, s3).then(result => {
        callback();
    }).catch(error => {
        console.log(error);
        callback("Failed");
    })
}

var backupGhostBlog = function(config, requestHandler, s3Client) {
    if(config.ghostUrl.charAt(config.ghostUrl.length-1) !== '/') {
        config.ghostUrl = config.ghostUrl.concat("/");
    }
    return requestHandler.post(config.ghostUrl + "authentication/token", {
        form: {
            grant_type: 'password',
            client_id: config.clientId,
            client_secret: config.secret,
            username: config.username,
            password: config.password
        }
    }).then(result => {
        var tokenResponse = JSON.parse(result);
        return requestHandler.get(config.ghostUrl + "db", {
            headers: {
              Authorization: 'Bearer ' + tokenResponse.access_token
            }
        });
    }).then(result => {
        return s3Client.putObject({
            'Bucket': config.s3Bucket,
            'Key': config.s3Key + "/" + moment().format() + ".json",
            'Body': result
        }).promise();
    });
};
exports.backupGhostBlog = backupGhostBlog;