let express = require('express');
let router = express.Router();

const awsWorker = require('../controllers/googleController.js');

router.post('/files/upload', upload.single("file"), awsWorker.doUpload);

router.get('/files/all', awsWorker.listKeyNames);

router.get('/files/:filename', awsWorker.doDownload);

module.exports = router;