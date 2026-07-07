const express = require("express");
const Attendance = require("../models/Attendance");
const { protect, authorize} = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "crew") {
      filter = { employee: req.user._id }
    } else if (req.user.role === "training_manager") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter = { clockIn: { $gte: startOfDay, $lte: endOfDay } };
    }
    const records = await Attendance.find(filter)
      .populate("employee", "name role level")
      .sort({ clockIn: -1 });
   
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
});

router.post("/clock-in", protect, authorize("store_manager", "training_manager"), async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

    const activeRecord = await Attendance.findOne({ employee: employeeId, status: "active" });
    if (activeRecord) return res.status(400).json({ message: "This crew member is already clocked in" });
    
    const record = await Attendance.create({
      employee: employeeId,
      clockIn: new Date(),
      status: "active",
    });

    const populated = await Attendance.findById(record._id).populate("employee", "name role level");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to clock in", error: error.message });
  }
});

router.put("/clock-out", protect, authorize("store_manager", "training_manager"), async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

    const record = await Attendance.findOne({ employee: employeeId, status: "active" });
    if (!record) return res.status(400).json({ message: "No active clock-in session found" });

    record.clockOut = new Date();
    const hoursWorked = (record.clockOut - record.clockIn) / (1000 * 60 * 60);
    record.hoursWorked = Math.round(hoursWorked * 100) / 100;
    record.status = "completed";

    await record.save();
    const populated = await Attendance.findById(record._id).populate("employee", "name role level");
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to clock out", error: error.message });
  }
});

module.exports = router;