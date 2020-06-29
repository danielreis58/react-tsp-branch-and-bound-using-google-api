const google = require('../config/google.config.js');
const env = require('../config/google.env.js');

exports.doUpload = (req, res) => {
    const params = {
        Bucket: env.Bucket + '/Larvas',
        Key: req.file.originalname,
        Body: req.file.buffer
    }

    google.upload(params, (err, data) => {
        if (err) {
            res.status(500).send("Error -> " + err);
        }
        res.send("File uploaded successfully! -> keyname = " + req.file.originalname);
    });
}

exports.doDownload = (req, res) => {
    const params = {
        Bucket: env.Bucket + '/Larvas',
        Key: req.params.filename
    }

    res.setHeader('Content-Disposition', 'attachment');

    google.getObject(params)
        .createReadStream()
        .on('error', function (err) {
            res.status(500).json({ error: "Error -> " + err });
        }).pipe(res);
}

exports.listKeyNames = (req, res) => {
    const params = {
        Bucket: env.Bucket,
        Prefix: 'Larvas/',
        StartAfter: 'Larvas/'
    }

    var keys = [];
    google.listObjectsV2(params, (err, data) => {
        if (err) {
            console.log(err, err.stack); // an error occurred
            res.send("error -> " + err);
        } else {
            var contents = data.Contents;
            contents.forEach(function (content) {
                keys.push(content.Key.replace('Larvas/', ''));
            });
            res.send(keys);
        }
    });
}