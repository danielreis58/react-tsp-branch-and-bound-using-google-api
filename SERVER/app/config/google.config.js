require('dotenv').config()
const GoogleMap = require('google-distance-matrix');

GoogleMap.key(process.env.REACT_APP_MAPS_ID);

module.exports = GoogleMap;