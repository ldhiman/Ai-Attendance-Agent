const express = require("express");

const Employee = require("../models/Employee");

const router = express.Router();

// ==========================================
// CREATE EMPLOYEE
// ==========================================

router.post("/", async (req, res) => {
  try {
    const {
      employeeId,
      name,
      phone,
      email,
      department,
      designation,
      locationId,
      shiftStart,
      shiftEnd,
    } = req.body;

    if (!employeeId || !name || !phone || !locationId) {
      return res.status(400).json({
        success: false,
        message: "employeeId, name, phone and locationId are required",
      });
    }

    const existingEmployee = await Employee.findOne({
      employeeId: employeeId.trim(),
    });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const location = await require("../models/Location").findById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.trim(),

      name: name.trim(),

      phone: phone.trim(),

      email: email || "",

      department: department || "",

      designation: designation || "",

      locationId,

      shiftStart: shiftStart || "09:00",

      shiftEnd: shiftEnd || "18:00",

      active: true,
    });

    const populatedEmployee = await Employee.findById(employee._id).populate(
      "locationId",
      "locationId name city state",
    );

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: populatedEmployee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
});

// ==========================================
// GET EMPLOYEES
// ==========================================

router.get("/", async (req, res) => {
  try {
    const { search, locationId, active, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (locationId) {
      filter.locationId = locationId;
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(filter)
      .populate("locationId", "locationId name city")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await Employee.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
});

// ==========================================
// GET EMPLOYEE
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "locationId",
      "locationId name city state",
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
    });
  }
});

module.exports = router;
