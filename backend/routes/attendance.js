const express = require("express");

const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Call = require("../models/Call");

const { createCall } = require("../services/hunar");

const router = express.Router();

// ======================================================
// GET ATTENDANCE
// ======================================================

router.get("/", async (req, res) => {
  try {
    const { date, locationId, status, page = 1, limit = 100 } = req.query;

    const targetDate = date || new Date().toISOString().split("T")[0];

    const filter = {
      date: targetDate,
    };

    if (locationId) {
      filter.locationId = locationId;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const attendance = await Attendance.find(filter)
      .populate("employeeId", "employeeId name phone department designation")
      .populate("locationId", "locationId name city state")
      .sort({
        checkInTime: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      date: targetDate,
      total,
      page: Number(page),
      limit: Number(limit),
      attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
});

// ======================================================
// DASHBOARD SUMMARY
// ======================================================

router.get("/summary", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const result = await Attendance.aggregate([
      {
        $match: {
          date,
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const summary = {
      PENDING: 0,
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      EXCUSED: 0,
      REVIEW_REQUIRED: 0,
    };

    result.forEach((item) => {
      summary[item._id] = item.count;
    });

    const totalEmployees = await Employee.countDocuments({
      active: true,
    });

    res.json({
      success: true,
      date,
      totalEmployees,
      summary,
      present: summary.PRESENT,
      late: summary.LATE,
      absent: summary.ABSENT,
      pending: summary.PENDING,
      reviewRequired: summary.REVIEW_REQUIRED,
    });
  } catch (error) {
    console.error("Attendance summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance summary",
    });
  }
});

// ======================================================
// START AI ATTENDANCE CALL
// ======================================================
//
// POST /api/attendance/start
//
// Body:
// {
//   "employeeIds": ["EMPLOYEE_MONGO_ID"]
// }
//
// ======================================================

router.post("/start", async (req, res) => {
  try {
    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "employeeIds must be a non-empty array",
      });
    }

    const agentId = process.env.HUNAR_ATTENDANCE_AGENT_ID;

    if (!agentId) {
      return res.status(500).json({
        success: false,
        message: "HUNAR_ATTENDANCE_AGENT_ID is not configured",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const employees = await Employee.find({
      _id: {
        $in: employeeIds,
      },
      active: true,
    }).populate("locationId", "locationId name city state timezone");

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active employees found",
      });
    }

    const results = [];

    for (const employee of employees) {
      try {
        // ==========================================
        // VALIDATION
        // ==========================================

        if (!employee.phone) {
          results.push({
            employeeId: employee._id,
            employeeCode: employee.employeeId,
            name: employee.name,
            success: false,
            message: "Employee phone number is missing",
          });

          continue;
        }

        if (!employee.locationId) {
          results.push({
            employeeId: employee._id,
            employeeCode: employee.employeeId,
            name: employee.name,
            success: false,
            message: "Employee location is missing",
          });

          continue;
        }

        // ==========================================
        // FIND TODAY'S ATTENDANCE
        // ==========================================

        let attendance = await Attendance.findOne({
          employeeId: employee._id,
          date: today,
        });

        if (!attendance) {
          attendance = await Attendance.create({
            employeeId: employee._id,

            locationId: employee.locationId._id,

            date: today,

            status: "PENDING",

            source: "VOICE_AI",
          });
        }

        // ==========================================
        // DON'T CALL ALREADY VERIFIED EMPLOYEE
        // ==========================================

        if (attendance.status === "PRESENT" || attendance.status === "LATE") {
          results.push({
            employeeId: employee._id,
            employeeCode: employee.employeeId,
            name: employee.name,
            success: false,
            message: `Attendance already marked ${attendance.status}`,
          });

          continue;
        }

        // ==========================================
        // CHECK ACTIVE CALL
        // ==========================================

        const activeCall = await Call.findOne({
          employeeId: employee._id,

          attendanceId: attendance._id,

          status: {
            $in: ["calling", "ringing", "in_progress"],
          },
        });

        if (activeCall) {
          results.push({
            employeeId: employee._id,
            employeeCode: employee.employeeId,
            name: employee.name,
            success: false,
            message: "Attendance call already in progress",
            callId: activeCall._id,
          });

          continue;
        }

        // ==========================================
        // CALL HUNAR
        // ==========================================

        const hunarResponse = await createCall({
          agentId,

          calleeName: employee.name,

          mobileNumber: employee.phone,

          customData: {
            employeeId: employee.employeeId,

            employeeMongoId: employee._id.toString(),

            employeeName: employee.name,

            department: employee.department || "",

            designation: employee.designation || "",

            locationId: employee.locationId.locationId,

            locationName: employee.locationId.name,

            city: employee.locationId.city,

            shiftStart: employee.shiftStart,

            shiftEnd: employee.shiftEnd,

            attendanceId: attendance._id.toString(),

            date: today,

            source: "ai-attendance",
          },

          requestId: `attendance-${attendance._id}-${Date.now()}`,

          timezone: employee.locationId.timezone || "Asia/Kolkata",
        });

        // ==========================================
        // GET HUNAR CALL ID
        // ==========================================

        const hunarCallId =
          hunarResponse?.call_id ||
          hunarResponse?.data?.call_id ||
          hunarResponse?.id ||
          hunarResponse?.data?.id;

        if (!hunarCallId) {
          results.push({
            employeeId: employee._id,
            employeeCode: employee.employeeId,
            name: employee.name,
            success: false,
            message: "Hunar did not return a call ID",
          });

          continue;
        }

        // ==========================================
        // CREATE LOCAL CALL RECORD
        // ==========================================

        const call = await Call.create({
          employeeId: employee._id,

          attendanceId: attendance._id,

          hunarCallId: String(hunarCallId),

          type: "ATTENDANCE_FOLLOWUP",

          status: "calling",

          startedAt: new Date(),
        });

        // ==========================================
        // UPDATE ATTENDANCE
        // ==========================================

        attendance.hunarCallId = String(hunarCallId);

        attendance.source = "VOICE_AI";

        await attendance.save();

        // ==========================================
        // SUCCESS
        // ==========================================

        results.push({
          employeeId: employee._id,

          employeeCode: employee.employeeId,

          name: employee.name,

          success: true,

          attendanceId: attendance._id,

          callId: call._id,

          hunarCallId: String(hunarCallId),

          status: "calling",
        });
      } catch (error) {
        console.error(
          `Attendance call failed for ${employee.name}:`,
          error.response?.data || error.message,
        );

        results.push({
          employeeId: employee._id,

          employeeCode: employee.employeeId,

          name: employee.name,

          success: false,

          message:
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to start attendance call",
        });
      }
    }

    const successful = results.filter((item) => item.success).length;

    const failed = results.filter((item) => !item.success).length;

    return res.status(201).json({
      success: true,
      total: results.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("Start attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start attendance calls",
      error: error.message,
    });
  }
});

module.exports = router;
