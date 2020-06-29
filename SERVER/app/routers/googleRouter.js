let express = require('express');
let router = express.Router();

const googleWorker = require('../controllers/googleController.js');

router.get('/matrixdistance', googleWorker.getMatrix);

module.exports = router;