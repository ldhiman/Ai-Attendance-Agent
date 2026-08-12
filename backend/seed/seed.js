const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");

const Employee = require("../models/Employee");
const Location = require("../models/Location");
const Attendance = require("../models/Attendance");

// ==========================================
// CONFIG
// ==========================================

const LOCATION_COUNT = 100;
const EMPLOYEE_COUNT = 1000;

// ==========================================
// DATA
// ==========================================

const firstNames = [
  "Rahul",
  "Amit",
  "Priya",
  "Neha",
  "Rohan",
  "Ankit",
  "Sneha",
  "Vikram",
  "Pooja",
  "Arjun",
  "Karan",
  "Simran",
  "Nikhil",
  "Ananya",
  "Aditya",
  "Meera",
  "Varun",
  "Isha",
  "Manish",
  "Kavya",
];

const lastNames = [
  "Sharma",
  "Kumar",
  "Singh",
  "Verma",
  "Gupta",
  "Patel",
  "Mehta",
  "Malhotra",
  "Kapoor",
  "Joshi",
  "Chopra",
  "Bansal",
  "Dhawan",
  "Saini",
  "Arora",
];

const cities = [
  ["Delhi", "Delhi"],
  ["Gurugram", "Haryana"],
  ["Noida", "Uttar Pradesh"],
  ["Mumbai", "Maharashtra"],
  ["Pune", "Maharashtra"],
  ["Bengaluru", "Karnataka"],
  ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"],
  ["Kolkata", "West Bengal"],
  ["Ahmedabad", "Gujarat"],
  ["Jaipur", "Rajasthan"],
  ["Chandigarh", "Chandigarh"],
  ["Lucknow", "Uttar Pradesh"],
  ["Indore", "Madhya Pradesh"],
  ["Kochi", "Kerala"],
];

const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Sales",
  "Marketing",
  "Operations",
  "Customer Support",
];

const designations = [
  "Software Engineer",
  "Senior Software Engineer",
  "Business Analyst",
  "HR Executive",
  "Sales Executive",
  "Operations Executive",
  "Product Analyst",
];

// ==========================================
// HELPERS
// ==========================================

const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const randomPhone = (index) => {
  return `+9198${String(index).padStart(8, "0")}`;
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

// ==========================================
// SEED
// ==========================================

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDatabase();

    console.log("Clearing existing seed data...");

    await Attendance.deleteMany({});
    await Employee.deleteMany({});
    await Location.deleteMany({});

    // ========================================
    // LOCATIONS
    // ========================================

    console.log(`Creating ${LOCATION_COUNT} locations...`);

    const locationData = [];

    for (let i = 1; i <= LOCATION_COUNT; i++) {
      const [city, state] = randomItem(cities);

      locationData.push({
        locationId: `LOC${String(i).padStart(3, "0")}`,

        name: `${city} Office ${Math.ceil(i / cities.length)}`,

        city,

        state,

        phoneNumber: `+9111${String(i).padStart(8, "0")}`,

        timezone: "Asia/Kolkata",

        active: true,
      });
    }

    const locations = await Location.insertMany(locationData);

    console.log(`${locations.length} locations created`);

    // ========================================
    // EMPLOYEES
    // ========================================

    console.log(`Creating ${EMPLOYEE_COUNT} employees...`);

    const employeeData = [];

    for (let i = 1; i <= EMPLOYEE_COUNT; i++) {
      const firstName = randomItem(firstNames);

      const lastName = randomItem(lastNames);

      const location = locations[Math.floor(Math.random() * locations.length)];

      employeeData.push({
        employeeId: `EMP${String(i).padStart(4, "0")}`,

        name: `${firstName} ${lastName}`,

        phone: randomPhone(i),

        email: `employee${i}@example.com`,

        department: randomItem(departments),

        designation: randomItem(designations),

        locationId: location._id,

        shiftStart: "09:00",

        shiftEnd: "18:00",

        active: true,
      });
    }

    const employees = await Employee.insertMany(employeeData);

    console.log(`${employees.length} employees created`);

    // ========================================
    // TODAY'S ATTENDANCE
    // ========================================

    console.log("Creating today's attendance...");

    const today = getToday();

    const attendanceData = employees.map((employee) => {
      /*
       * Mostly pending initially.
       * This makes the demo realistic.
       */

      const random = Math.random();

      let status = "PENDING";

      let checkInTime = null;

      if (random < 0.65) {
        status = "PRESENT";

        checkInTime = new Date();
      } else if (random < 0.75) {
        status = "LATE";

        checkInTime = new Date();
      }

      return {
        employeeId: employee._id,

        locationId: employee.locationId,

        date: today,

        status,

        checkInTime,

        source: status === "PENDING" ? "SYSTEM" : "VOICE_AI",

        verification: status === "PENDING" ? "NOT_VERIFIED" : "HIGH",

        employeeVerified: status !== "PENDING",

        locationVerified: status !== "PENDING",

        reason:
          status === "PRESENT"
            ? "Employee verified successfully"
            : status === "LATE"
              ? "Employee checked in after shift start"
              : "",
      };
    });

    const attendance = await Attendance.insertMany(attendanceData);

    console.log(`${attendance.length} attendance records created`);

    // ========================================
    // SUMMARY
    // ========================================

    const summary = await Attendance.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    console.log("\nToday's attendance:");

    summary.forEach((item) => {
      console.log(`${item._id}: ${item.count}`);
    });

    console.log("\nSeed completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seed();
