const AWS = require('google-distance-matrix');
const env = require('./google.env.js');

const google = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.REGION
});

module.exports = google;