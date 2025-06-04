const LeaveModel = require("../models/leaveModel");
const PartnerModel = require("../models/partnerModel");
const Helper = require("../utils/helper");
const mongoose = require("mongoose");

const createLeave = async (req, res) => {
  try {
    const partnerId = req.userId;
    const { startDate, endDate, leaveType, startTime, endTime, reason } = req.body;

    if (!partnerId || !startDate || !endDate || !leaveType || !reason) {
      return Helper.fail(res, "Required fields are missing");
    }

    if (leaveType === "hourly" && (!startTime || !endTime)) {
      return Helper.fail(res, "Hourly leave must include startTime and endTime");
    }

    const leave = await LeaveModel.create({
      partnerId,
      startDate,
      endDate,
      leaveType,
      startTime: leaveType === "hourly" ? startTime : undefined,
      endTime: leaveType === "hourly" ? endTime : undefined,
      reason,
    });

    return Helper.success(res, "Leave created successfully", leave);
  } catch (error) {
    console.error("Create Leave Error:", error);
    return Helper.fail(res, error.message);
  }
};

const updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const updates = req.body;

    const leave = await LeaveModel.findByIdAndUpdate(leaveId, updates, { new: true });

    if (!leave) return Helper.fail(res, "Leave not found");

    return Helper.success(res, "Leave updated successfully", leave);
  } catch (error) {
    console.error("Update Leave Error:", error);
    return Helper.fail(res, error.message);
  }
};


const deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const deleted = await LeaveModel.findByIdAndUpdate(
      leaveId,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return Helper.fail(res, "Leave not found");

    return Helper.success(res, "Leave deleted successfully (soft delete)", deleted);
  } catch (error) {
    console.error("Soft Delete Leave Error:", error);
    return Helper.fail(res, error.message);
  }
};



const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return Helper.fail(res, "Invalid status value");
    }

    const updated = await LeaveModel.findByIdAndUpdate(leaveId, { status }, { new: true });
    if (!updated) return Helper.fail(res, "Leave not found");

    return Helper.success(res, `Leave ${status.toLowerCase()} successfully`, updated);
  } catch (error) {
    console.error("Status Update Error:", error);
    return Helper.fail(res, error.message);
  }
};


const listLeaves = async (req, res) => {
  try {
    const {
      search = "",
      leaveType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.body;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (req.type === "partner") {
      query.partnerId = req.userId;
    }
    if (leaveType) query.leaveType = leaveType;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }
    let partnerMatch = {};
    if (search && req.type === "admin") {
      const partners = await PartnerModel.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      partnerMatch.partnerId = { $in: partners.map(p => p._id) };
    }

    const leaves = await LeaveModel.find({ ...query, ...partnerMatch })
      .populate("partnerId", "name email phoneNo address location ")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LeaveModel.countDocuments({ ...query, ...partnerMatch });

    return Helper.success(res, "Leaves fetched successfully", {
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: leaves,
    });
  } catch (error) {
    console.error("List Leaves Error:", error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  createLeave,
  updateLeave,
  deleteLeave,
  updateLeaveStatus,
  listLeaves,
};
