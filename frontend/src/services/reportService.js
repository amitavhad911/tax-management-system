import api from "./api";

const getDashboard = () => {
  return api.get("/reports/dashboard");
};

const getTopTaxpayers = (limit = 5) => {
  return api.get("/reports/top-taxpayers", {
    params: {
      n: limit,
    },
  });
};

const getSummary = () => {
  return api.get("/reports/summary");
};

const exportPdf = () => {
  return api.get("/reports/export/pdf", {
    responseType: "blob",
  });
};

const exportExcel = () => {
  return api.get("/reports/export/excel", {
    responseType: "blob",
  });
};

export default {
  getDashboard,
  getTopTaxpayers,
  getSummary,
  exportPdf,
  exportExcel,
};