import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDashboardSummary = async () => {
  const response = await api.get("/attendance/summary");

  return response.data;
};

export const getAttendance = async (params = {}) => {
  const response = await api.get("/attendance", { params });

  return response.data;
};

export const getEmployees = async (params = {}) => {
  const response = await api.get("/employees", { params });

  return response.data;
};

export const getLocations = async () => {
  const response = await api.get("/locations");

  return response.data;
};

export const getCalls = async (params = {}) => {
  const response = await api.get("/calls", { params });

  return response.data;
};

export const startAttendance = async (employeeIds) => {
  const response = await api.post("/attendance/start", {
    employeeIds,
  });

  return response.data;
};

export const createEmployee = async (employee) => {
  const response = await api.post("/employees", employee);

  return response.data;
};

export const createLocation = async (location) => {
  const response = await api.post("/locations", location);

  return response.data;
};

export const generateAttendance = async () => {
  const response = await api.post("/attendance/generate");

  return response.data;
};

export default api;
