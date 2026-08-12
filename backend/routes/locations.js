const express = require("express");

const Location = require("../models/Location");

const Employee = require("../models/Employee");

const router = express.Router();

// ==========================================
// GET LOCATIONS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().sort({
      locationId: 1,
    });

    const locationsWithCounts = await Promise.all(
      locations.map(async (location) => {
        const employeeCount = await Employee.countDocuments({
          locationId: location._id,
          active: true,
        });

        return {
          ...location.toObject(),
          employeeCount,
        };
      }),
    );

    res.json({
      success: true,
      locations: locationsWithCounts,
    });
  } catch (error) {
    console.error("Get locations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
});

// ==========================================
// GET LOCATION
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const employeeCount = await Employee.countDocuments({
      locationId: location._id,
      active: true,
    });

    res.json({
      success: true,

      location: {
        ...location.toObject(),
        employeeCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch location",
    });
  }
});

module.exports = router;
