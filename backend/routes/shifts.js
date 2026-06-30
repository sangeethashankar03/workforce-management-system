const express = require("express");
const { body, validationResult } = require("express-validator");
const Shift = require("../models/Shift");
const { protect, authorize } = require("../middleware/auth");
const { sanitizeText } = require("../middleware/sanitize");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "employee" ? { employee: req.user._id } : {};
    const shifts = await Shift.find(filter)
      .populate("employee", "name email")
      .populate("createdBy", "name")
      .sort({ date: 1 });
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shifts", error: error.message });
  }
});

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  [
    body("employee").notEmpty().withMessage("Employee is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("startTime").notEmpty().withMessage("Start time is required"),
    body("endTime").notEmpty().withMessage("End time is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const shift = await Shift.create({
        employee: req.body.employee,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        notes: sanitizeText(req.body.notes || ""),
        createdBy: req.user._id,
      });
      res.status(201).json(shift);
    } catch (error) {
      res.status(500).json({ message: "Failed to create shift", error: error.message });
    }
  }
);

router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  [
    body("date").optional().notEmpty().withMessage("Date cannot be empty"),
    body("startTime").optional().notEmpty().withMessage("Start time cannot be empty"),
    body("endTime").optional().notEmpty().withMessage("End time cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const shift = await Shift.findById(req.params.id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      const { date, startTime, endTime, notes, employee } = req.body;
      if (date !== undefined) shift.date = date;
      if (startTime !== undefined) shift.startTime = startTime;
      if (endTime !== undefined) shift.endTime = endTime;
      if (notes !== undefined) shift.notes = sanitizeText(notes);
      if (employee !== undefined) shift.employee = employee;

      await shift.save();
      res.status(200).json(shift);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shift", error: error.message });
    }
  }
);

router.delete("/:id", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    await shift.deleteOne();
    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete shift", error: error.message });
  }
});

module.exports = router;