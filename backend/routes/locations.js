const express = require("express");

const Location = require("../models/Location");

const Employee = require("../models/Employee");

const router = express.Router();

// ==========================================
// CREATE LOCATION
// ==========================================

router.post("/", async (req, res) => {
  try {
    const { locationId, name, city, state, phoneNumber, timezone } = req.body;

    if (!locationId || !name) {
      return res.status(400).json({
        success: false,
        message: "locationId and name are required",
      });
    }

    const existing = await Location.findOne({
      locationId: locationId.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Location ID already exists",
      });
    }

    const location = await Location.create({
      locationId: locationId.trim(),
      name: name.trim(),
      city: city || "",
      state: state || "",
      phoneNumber: phoneNumber || "",
      timezone: timezone || "Asia/Kolkata",
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.error("Create location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create location",
      error: error.message,
    });
  }
});

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
