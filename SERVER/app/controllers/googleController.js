const google = require('../config/google.config.js');

exports.getMatrix = (req, res) => {
    google.matrix(req.body.stgLatLng, req.body.stgLatLng, function (err, response) {
        if (!err) {
            res.send(response)
        } else {
            res.send(err)
        }
    })
}