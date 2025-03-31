const express = require("express");
const router = express.Router();
const { createPartner } = require("../controller/partnerController");

/*--------------------------------user Routes-------------------------------*/
router.post("/createPartner", createPartner)

module.exports = router;