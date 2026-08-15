import api from "./api";

// --------------------------------------------------
// Compute Tax
// --------------------------------------------------

const compute = (data) => {
  return api.post("/tax/compute", data);
};

// --------------------------------------------------
// Get Tax Record By ID
// --------------------------------------------------

const getById = (id) => {
  return api.get(`/tax/${id}`);
};

// --------------------------------------------------
// Get Tax History For One User
// --------------------------------------------------
// Kept for existing functionality / future use.

const getHistory = (userId) => {
  return api.get(`/tax/history/${userId}`);
};

// --------------------------------------------------
// Get GLOBAL Tax History
// --------------------------------------------------
// Returns tax records for all taxpayers.

const getAllHistory = () => {
  return api.get("/tax/history");
};

// --------------------------------------------------
// Update Tax Record
// --------------------------------------------------

const update = (id, data) => {
  return api.put(`/tax/${id}`, data);
};

// --------------------------------------------------
// Delete Tax Record
// --------------------------------------------------

const remove = (id) => {
  return api.delete(`/tax/${id}`);
};

// --------------------------------------------------
// Export
// --------------------------------------------------

export default {
  compute,
  getById,
  getHistory,
  getAllHistory,
  update,
  remove,
};