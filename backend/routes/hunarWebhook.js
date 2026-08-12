const express = require("express");

const Attendance = require("../models/Attendance");

const { getAgents } = require("../services/hunar");

const Call = require("../models/Call");

const router = express.Router();

// ==========================================
// HUNAR WEBHOOK
// ==========================================

router.post("/", async (req, res) => {
  try {
    console.log("========== HUNAR WEBHOOK ==========");

    console.log(JSON.stringify(req.body, null, 2));

    const callId = req.body.call_id || req.body.callId || req.body.id;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "call_id is required",
      });
    }

    const call = await Call.findOne({
      hunarCallId: String(callId),
    });

    if (!call) {
      console.warn("Call not found:", callId);

      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    // ======================================
    // EXTRACT EVENT DATA
    // ======================================

    const eventType = req.body.event_type || req.body.eventType || "";

    const status = req.body.status || req.body.call_status;

    const transcript = req.body.transcript || req.body.transcript_text || "";

    const summary = req.body.summary || "";

    const recordingUrl = req.body.recording_url || req.body.recordingUrl || "";

    // ======================================
    // UPDATE CALL
    // ======================================

    const callUpdate = {};

    if (status) {
      callUpdate.status = status;
    }

    if (transcript) {
      callUpdate.transcript = transcript;
    }

    if (summary) {
      callUpdate.summary = summary;
    }

    if (recordingUrl) {
      callUpdate.recordingUrl = recordingUrl;
    }

    if (req.body.started_at) {
      callUpdate.startedAt = req.body.started_at;
    }

    if (req.body.ended_at) {
      callUpdate.endedAt = req.body.ended_at;
    }

    // ======================================
    // RESULT
    // ======================================

    if (req.body.result || req.body.data?.result) {
      callUpdate.result = req.body.result || req.body.data.result;
    }

    await Call.findByIdAndUpdate(call._id, callUpdate);

    // ======================================
    // ATTENDANCE RESULT
    // ======================================

    const result = req.body.result || req.body.data?.result || {};

    if (result && typeof result === "object") {
      const attendanceUpdate = {};

      if (result.attendance_status) {
        attendanceUpdate.status = result.attendance_status;
      }

      if (result.employee_verified !== undefined) {
        attendanceUpdate.employeeVerified = Boolean(result.employee_verified);
      }

      if (result.location_verified !== undefined) {
        attendanceUpdate.locationVerified = Boolean(result.location_verified);
      }

      if (result.verification) {
        attendanceUpdate.verification = result.verification;
      }

      if (result.reason) {
        attendanceUpdate.reason = result.reason;
      }

      if (Object.keys(attendanceUpdate).length > 0) {
        if (
          attendanceUpdate.status === "PRESENT" ||
          attendanceUpdate.status === "LATE"
        ) {
          attendanceUpdate.checkInTime = new Date();
        }

        await Attendance.findByIdAndUpdate(call.attendanceId, attendanceUpdate);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Hunar webhook processed",
      eventType,
      callId: String(callId),
    });
  } catch (error) {
    console.error("Hunar webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process webhook",
    });
  }
});

router.get("/agents", async (req, res) => {
  try {
    const agents = await getAgents();

    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Hunar agents",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
