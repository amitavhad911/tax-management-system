import api from "./api";

// =========================================================
// DASHBOARD
// =========================================================

const getDashboard = () => {
  return api.get("/reports/dashboard");
};

// =========================================================
// TOP TAXPAYERS
// =========================================================

const getTopTaxpayers = (limit = 5) => {
  return api.get("/reports/top-taxpayers", {
    params: {
      n: limit,
    },
  });
};

// =========================================================
// SUMMARY
// =========================================================

const getSummary = () => {
  return api.get("/reports/summary");
};

// =========================================================
// ALL COMPLETED TAX COMPUTATIONS
// =========================================================
// Uses the existing global Tax History API.
//
// Returns all completed/saved tax computations with:
// - taxpayer ID
// - taxpayer name
// - PAN
// - taxpayer type
// - financial year
// - income
// - taxable income
// - tax rate
// - tax liability

const getAllHistory = () => {
  return api.get("/tax/history");
};

// =========================================================
// EXPORT PDF
// =========================================================

const exportPdf = () => {
  return api.get("/reports/export/pdf", {
    responseType: "blob",
  });
};

// =========================================================
// EXPORT EXCEL
// =========================================================

const exportExcel = () => {
  return api.get("/reports/export/excel", {
    responseType: "blob",
  });
};

// =========================================================
// EXPORT
// =========================================================

export default {
  getDashboard,
  getTopTaxpayers,
  getSummary,
  getAllHistory,
  exportPdf,
  exportExcel,
};