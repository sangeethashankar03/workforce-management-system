const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/:countryCode/:year", protect, async (req, res) => {
  try {
    const { countryCode, year } = req.params;
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: "Failed to fetch holidays from external API" });
    }

    const holidays = await response.json();
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Error contacting external holidays API", error: error.message });
  }
});

module.exports = router;