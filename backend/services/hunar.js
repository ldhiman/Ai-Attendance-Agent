const axios = require("axios");

const HUNAR_BASE_URL =
  process.env.HUNAR_BASE_URL || "https://api.voice.hunar.ai/external/v1";

const hunar = axios.create({
  baseURL: HUNAR_BASE_URL,

  headers: {
    "X-API-Key": process.env.HUNAR_API_KEY,

    "Content-Type": "application/json",

    Accept: "application/json",
  },

  timeout: 30000,
});

// ==========================================
// GET AGENTS
// ==========================================

const getAgents = async () => {
  const response = await hunar.get("/agents/");

  return response.data;
};

// ==========================================
// GET AGENT
// ==========================================

const getAgent = async (agentId) => {
  if (!agentId) {
    throw new Error("agentId is required");
  }

  const response = await hunar.get(`/agents/${agentId}/`);

  return response.data;
};

// ==========================================
// CREATE CALL
// ==========================================

const createCall = async ({
  agentId,
  calleeName,
  mobileNumber,
  customData = {},
  requestId,
  timezone = "Asia/Kolkata",
}) => {
  if (!agentId) {
    throw new Error("agentId is required");
  }

  if (!calleeName) {
    throw new Error("calleeName is required");
  }

  if (!mobileNumber) {
    throw new Error("mobileNumber is required");
  }

  if (!process.env.HUNAR_WEBHOOK_URL) {
    throw new Error("HUNAR_WEBHOOK_URL is not configured");
  }

  const payload = {
    agent_id: agentId,

    callee_name: calleeName,

    mobile_number: mobileNumber,

    custom_data: customData,

    request_id: requestId || `attendance-${Date.now()}`,

    timezone,

    callback_config: {
      call_status_callback_url: process.env.HUNAR_WEBHOOK_URL,

      call_recording_callback_url: process.env.HUNAR_WEBHOOK_URL,

      call_result_callback_url: process.env.HUNAR_WEBHOOK_URL,

      call_summary_callback_url: process.env.HUNAR_WEBHOOK_URL,
    },
  };

  try {
    const response = await hunar.post("/calls/", payload);

    return response.data;
  } catch (error) {
    console.error(
      "Hunar create call error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ==========================================
// GET CALL
// ==========================================

const getCall = async (callId) => {
  if (!callId) {
    throw new Error("callId is required");
  }

  const response = await hunar.get(`/calls/${callId}/`);

  return response.data;
};

// ==========================================
// GET CALLS
// ==========================================

const getCalls = async ({ status, page = 1, pageSize = 20 } = {}) => {
  const params = {
    page,
    page_size: pageSize,
  };

  if (status) {
    params.status = status;
  }

  const response = await hunar.get("/calls/", { params });

  return response.data;
};

module.exports = {
  getAgents,
  getAgent,
  createCall,
  getCall,
  getCalls,
};
