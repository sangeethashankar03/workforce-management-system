const express = require("express");
const { body, validationResult } = require("express-validator");
const Department = require("../models/Department");
const { protect, authorize } = require("../middleware/auth");
const { sanitizeText } = require("../middleware/sanitize");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error: error.message });
  }
});

router.post(
  "/",
  protect,
  authorize("admin"),
  [body("name").trim().notEmpty().withMessage("Department name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = await Department.findOne({ name: req.body.name });
      if (existing) {
        return res.status(400).json({ message: "Department already exists" });
      }

      const department = await Department.create({
        name: sanitizeText(req.body.name),
        description: sanitizeText(req.body.description || ""),
      });
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to create department", error: error.message });
    }
  }
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [body("name").optional().trim().notEmpty().withMessage("Department name cannot be empty")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const department = await Department.findById(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      if (req.body.name !== undefined) department.name = sanitizeText(req.body.name);
      if (req.body.description !== undefined) department.description = sanitizeText(req.body.description);

      await department.save();
      res.status(200).json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to update department", error: error.message });
    }
  }
);

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    await department.deleteOne();
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department", error: error.message });
  }
});

module.exports = router;