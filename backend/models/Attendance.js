const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },

    date: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PRESENT",
        "LATE",
        "ABSENT",
        "EXCUSED",
        "REVIEW_REQUIRED",
      ],
      default: "PENDING",
      index: true,
    },

    checkInTime: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      enum: ["VOICE_AI", "HR", "SYSTEM"],
      default: "VOICE_AI",
    },

    verification: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW", "NOT_VERIFIED"],
      default: "NOT_VERIFIED",
    },

    employeeVerified: {
      type: Boolean,
      default: false,
    },

    locationVerified: {
      type: Boolean,
      default: false,
    },

    hunarCallId: {
      type: String,
      default: "",
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

    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// One attendance record per employee per day
attendanceSchema.index(
  {
    employeeId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
