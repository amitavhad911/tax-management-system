import api from "./api";

const exportData = (format = "json") => {
  return api.get("/backup/export", {
    params: { format },
    responseType: "blob",
  });
};

const restore = (formData) => {
  return api.post("/backup/restore", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default {
  exportData,
  restore,
};