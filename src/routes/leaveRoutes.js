const express = require("express");
const router = express.Router();
const leaveController = require("../controller/leaveController");
const { isAuth } = require("../utils/auth");

router.post("/create", isAuth, leaveController.createLeave);
router.post("/update/:leaveId", isAuth, leaveController.updateLeave);
router.post("/remove/:leaveId", isAuth, leaveController.deleteLeave);
router.post("/updateStatus/:leaveId", isAuth, leaveController.updateLeaveStatus);
router.post("/list", isAuth, leaveController.listLeaves);

module.exports = router;
