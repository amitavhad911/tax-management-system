import api from "./api";

const ask = (question) => {
  return api.post("/ai/ask", {
    question: question.trim(),
  });
};

const suggestDeductions = () => {
  return api.post("/ai/suggest-deductions");
};

const summarize = (userId) => {
  return api.post(`/ai/summarize/${userId}`);
};

const explainTax = (taxRecordId) => {
  return api.post(`/ai/explain-tax/${taxRecordId}`);
};

export default {
  ask,
  suggestDeductions,
  summarize,
  explainTax,
};