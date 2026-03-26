import axios from "axios";

// Base URL of your Spring Boot backend
const API_BASE_URL = "http://localhost:9090/api"; // change if deployed
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Register user
export const registerUser = async (email, password, role = "USER") => {
  try {
    const response = await API.post("/register", { email, password, role });
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Registration failed!";
  }
};

// ✅ Login user
export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/login", { email, password });
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Login failed!";
  }
};

// ✅ Get API status
export const getStatus = async () => {
  try {
    const response = await API.get("/status");
    return response.data;
  } catch (error) {
    return "❌ Unable to fetch status!";
  }
};

// ✅ Get Admin Stats
export const getAdminStats = async () => {
  try {
    const response = await API.get("/admin/stats");
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch admin stats!";
  }
};

// ✅ Get all users (Admin)
export const getAllUsers = async () => {
  try {
    const response = await API.get("/admin/users");
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch users!";
  }
};

// ✅ Get all plants (Admin)
export const getAllPlants = async () => {
  try {
    const response = await API.get("/admin/plants");
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch plants!";
  }
};

// ✅ Get all reminders (Admin)
export const getAllReminders = async () => {
  try {
    const response = await API.get("/admin/reminders");
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch reminders!";
  }
};


// ================= USER API =================

// ✅ Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch user profile!";
  }
};

// ✅ Update user profile
export const updateUserProfile = async (userId, updatedData) => {
  try {
    const response = await API.put(`/user/${userId}`, updatedData);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to update user profile!";
  }
};

// ✅ Get user's plants
export const getUserPlants = async (userId) => {
  try {
    const response = await API.get(`/user/${userId}/plants`);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch user plants!";
  }
};

// ✅ Add a new plant for user
export const addUserPlant = async (userId, plantData) => {
  try {
    const response = await API.post(`/user/${userId}/plants`, plantData);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to add plant!";
  }
};

// ✅ Get user's reminders
export const getUserReminders = async (userId) => {
  try {
    const response = await API.get(`/user/${userId}/reminders`);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to fetch reminders!";
  }
};

// ✅ Add a reminder for user
export const addUserReminder = async (userId, reminderData) => {
  try {
    const response = await API.post(`/user/${userId}/reminders`, reminderData);
    return response.data;
  } catch (error) {
    return error.response?.data || "❌ Unable to add reminder!";
  }
};
