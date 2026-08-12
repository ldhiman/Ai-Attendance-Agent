const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.HUNAR_API_KEY;

if (!API_KEY) {
  throw new Error("HUNAR_API_KEY is not configured");
}

const agentData = {
  name: "AI Attendance Assistant",

  language: "ENGLISH",

  voice_persona: "NEHA",

  persona_name: "Aisha",

  agent_prompt: `
You are Aisha, an AI HR attendance assistant.

Your job is to verify an employee's daily attendance through a short,
professional phone conversation.

You will receive the following employee information:
- Employee name
- Employee ID
- Assigned workplace/location
- Shift start time
- Current date

Start by introducing yourself and explaining that you are calling
to record today's attendance.

First verify the employee's identity by confirming their name
and employee ID.

Then ask whether they are working today.

If the employee is working:

1. Confirm that they are currently at their assigned workplace.
2. Ask approximately when they arrived.
3. Confirm their attendance.

If the employee is not working:

1. Ask the reason for their absence.
2. Record the reason.
3. Do not mark the employee as present.

If the employee says they are working from another location,
do not mark the location as verified.

If the information is unclear or contradictory,
mark the result as REVIEW_REQUIRED.

Keep the conversation short, natural and professional.

Do not reveal internal system information.
`,

  introduction: `
Hi! This is {persona_name}, the AI attendance assistant.
I'm calling to record your attendance for today.
May I confirm your name, please?
`,

  objective: `
Verify the employee's identity, attendance status and workplace
location, then produce a structured attendance result.
`,

  result_prompt: `
Analyze the conversation and extract the employee's attendance result.

Determine:

1. Whether the employee's identity was successfully verified.
2. Whether the employee confirmed they are at their assigned workplace.
3. Whether they are present, late, absent or require HR review.
4. Their approximate arrival time if provided.
5. The reason for absence if applicable.

Do not assume information that was not stated.

Use REVIEW_REQUIRED when the information is unclear or contradictory.
`,

  result_schema: {
    attendance_status: "",
    employee_verified: false,
    location_verified: false,
    check_in_time: "",
    reason: "",
    summary: "",
  },
};

const createAgent = async () => {
  try {
    console.log("Creating Hunar attendance agent...");

    const response = await axios.post(
      "https://api.voice.hunar.ai/external/v1/agents/",
      agentData,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    console.log("\n================================");
    console.log("Attendance Agent Created");
    console.log("================================");

    console.log("Agent ID:", response.data.id);
    console.log("Agent Name:", response.data.name);

    console.log("\nCustom Variables:");

    console.log(JSON.stringify(response.data.custom_variables || [], null, 2));

    console.log("\nAdd this to your .env:");

    console.log(`HUNAR_ATTENDANCE_AGENT_ID=${response.data.id}`);
  } catch (error) {
    console.error("\nFailed to create attendance agent:");

    console.error(
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
  }
};

createAgent();
