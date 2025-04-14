const express = require('express');
const { upload } = require("../utils/upload")
const { uploadFile } = require("../controller/uploadController")
const router = express.Router();


// upload('s3').array('images', 10)  use for uploading multiple files or array

// router.post('/submit', upload('s3').single('file'), uploadFile);
router.post('/submit', upload('s3').array('file', 10), uploadFile);
module.exports = router;