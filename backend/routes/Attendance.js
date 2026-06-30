const express = require("express");
const Attendance = require("../models/Attendance");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "employee" ? { employee: req.user._id } : {};
    const records = await Attendance.find(filter)
      .populate("employee", "name email")
      .sort({ clockIn: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
});

router.post("/clock-in", protect, async (req, res) => {
  try {
    const activeRecord = await Attendance.findOne({ employee: req.user._id, status: "active" });
    if (activeRecord) {
      return res.status(400).json({ message: "You are already clocked in" });
    }

    const record = await Attendance.create({
      employee: req.user._id,
      clockIn: new Date(),
      status: "active",
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to clock in", error: error.message });
  }
});

router.put("/clock-out", protect, async (req, res) => {
  try {
    const record = await Attendance.findOne({ employee: req.user._id, status: "active" });
    if (!record) {
      return res.status(400).json({ message: "No active clock-in session found" });
    }

    record.clockOut = new Date();
    const hoursWorked = (record.clockOut - record.clockIn) / (1000 * 60 * 60);
    record.hoursWorked = Math.round(hoursWorked * 100) / 100;
    record.status = "completed";

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Failed to clock out", error: error.message });
  }
});

module.exports = router;