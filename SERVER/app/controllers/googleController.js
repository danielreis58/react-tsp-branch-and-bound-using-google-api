const google = require('../config/google.config.js');


exports.getMatrix = async (req, res) => {
    console.log('BODY', req.body)
    google.mode(req.body.mode.toLowerCase())
    await google.matrix(req.body.stgLatLng, req.body.stgLatLng, function (err, response) {
        if (!err) {
            console.log(response)
            res.send(response)
        } else {
            res.send(err)
        }
    })
}