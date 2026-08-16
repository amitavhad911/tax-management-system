import api from "./api";

// --------------------------------------------------
// Ask AI using selected taxpayer context
// --------------------------------------------------

const ask = (question, userId) => {
  return api.post("/ai/ask", {
    question: question.trim(),
    userId,
  });
};


// --------------------------------------------------
// Suggest deductions for selected taxpayer
// --------------------------------------------------

const suggestDeductions = (userId) => {
  return api.post("/ai/suggest-deductions", null, {
    params: {
      userId,
    },
  });
};


// --------------------------------------------------
// Summarize taxpayer history
// --------------------------------------------------

const summarize = (userId) => {
  return api.post(`/ai/summarize/${userId}`);
};


// --------------------------------------------------
// Explain specific tax computation
// --------------------------------------------------

const explainTax = (taxRecordId) => {
  return api.post(`/ai/explain-tax/${taxRecordId}`);
};


// --------------------------------------------------
// Export
// --------------------------------------------------

export default {
  ask,
  suggestDeductions,
  summarize,
  explainTax,
};