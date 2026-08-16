import api from "./api";

// --------------------------------------------------
// Get logged-in administrator profile
// --------------------------------------------------

const getProfile = () => {
  return api.get("/admin/profile");
};


// --------------------------------------------------
// Update logged-in administrator profile
// --------------------------------------------------

const updateProfile = (data) => {
  return api.put("/admin/profile", data);
};


// --------------------------------------------------
// Change administrator password
// --------------------------------------------------

const changePassword = (data) => {
  return api.put("/admin/password", data);
};


export default {
  getProfile,
  updateProfile,
  changePassword,
};