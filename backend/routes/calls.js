const express = require("express");

const Call = require("../models/Call");

const router = express.Router();

// ==========================================
// GET CALLS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const calls = await Call.find(filter)
      .populate("employeeId", "employeeId name phone department")
      .populate("attendanceId", "date status checkInTime")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await Call.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      calls,
    });
  } catch (error) {
    console.error("Get calls error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch calls",
    });
  }
});

// ==========================================
// GET SINGLE CALL
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const call = await Call.findById(req.params.id)
      .populate("employeeId")
      .populate("attendanceId");

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch call",
    });
  }
});

module.exports = router;
