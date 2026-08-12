const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
      index: true,
    },

    hunarCallId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["ATTENDANCE_CHECKIN", "ATTENDANCE_FOLLOWUP"],
      default: "ATTENDANCE_FOLLOWUP",
    },

    status: {
      type: String,
      default: "calling",
      index: true,
    },

    transcript: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    recordingUrl: {
      type: String,
      default: "",
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Call", callSchema);
