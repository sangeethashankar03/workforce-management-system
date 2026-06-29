const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const { sanitizeText } = require("../middleware/sanitize");

const router = express.Router();

router.get("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const employees = await User.find().populate("department", "name").select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    if (req.user.role === "employee" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "You can only view your own profile" });
    }

    const employee = await User.findById(req.params.id).populate("department", "name").select("-password");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error: error.message });
  }
});

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role, department, position, phone } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const employee = await User.create({
        name: sanitizeText(name),
        email,
        password: hashedPassword,
        role: role || "employee",
        department: department || null,
        position: sanitizeText(position || ""),
        phone: sanitizeText(phone || ""),
      });

      const { password: _pw, ...employeeWithoutPassword } = employee.toObject();
      res.status(201).json(employeeWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
  }
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("role").optional().isIn(["admin", "manager", "employee"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, role, department, position, phone, isActive, leaveBalance } = req.body;

      const employee = await User.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      if (name !== undefined) employee.name = sanitizeText(name);
      if (email !== undefined) employee.email = email;
      if (role !== undefined) employee.role = role;
      if (department !== undefined) employee.department = department;
      if (position !== undefined) employee.position = sanitizeText(position);
      if (phone !== undefined) employee.phone = sanitizeText(phone);
      if (isActive !== undefined) employee.isActive = isActive;
      if (leaveBalance !== undefined) employee.leaveBalance = leaveBalance;

      await employee.save();

      const { password: _pw, ...employeeWithoutPassword } = employee.toObject();
      res.status(200).json(employeeWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee", error: error.message });
    }
  }
);

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.deleteOne();
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee", error: error.message });
  }
});

module.exports = router;