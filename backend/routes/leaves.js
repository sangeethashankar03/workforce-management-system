const express = require("express");
const { body, validationResult } = require("express-validator");
const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { sanitizeText } = require("../middleware/sanitize");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "crew" ? { employee: req.user._id } : {};
    const leaves = await LeaveRequest.find(filter)
      .populate("employee", "name email")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leave requests", error: error.message });
  }
});

router.post(
  "/",
  protect,
  [
    body("startDate").notEmpty().withMessage("Start date is required"),
    body("endDate").notEmpty().withMessage("End date is required"),
    body("reason").trim().notEmpty().withMessage("Reason is required"),
    body("leaveType").trim().notEmpty().withMessage("Leave type is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const leave = await LeaveRequest.create({
        employee: req.user._id,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        leaveType: req.body.leaveType,
        reason: sanitizeText(req.body.reason),
      });
      res.status(201).json(leave);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit leave request", error: error.message });
    }
  }
);

router.put("/:id/review", protect, authorize("store_manager"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    await leave.save();

    if (status === "approved") {
      const days = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
      await User.findByIdAndUpdate(leave.employee, { $inc: { leaveBalance: -days } });
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Failed to review leave request", error: error.message });
  }
});

module.exports = router;
