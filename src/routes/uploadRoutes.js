const express = require('express');
const { upload } = require("../utils/upload")
const { uploadFile } = require("../controller/uploadController")
const router = express.Router();


// upload('s3').array('images', 10)  use for uploading multiple files or array

<<<<<<< HEAD
// router.post('/submit', upload('s3').single('file'), uploadFile);
router.post('/submit', upload('s3').array('file', 10), uploadFile);
=======
router.post('/submit', upload('s3').single('file'), uploadFile);
>>>>>>> 9ba69b776c7b5df377048f98bfc07d3885daa17f
module.exports = router;