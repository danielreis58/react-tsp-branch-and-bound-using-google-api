const GoogleMap = require('google-distance-matrix');

const apiKey = GoogleMap.key(process.env.REACT_APP_MAPS_ID);

module.exports = apiKey;