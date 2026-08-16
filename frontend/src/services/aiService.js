import api from "./api";

// --------------------------------------------------
// Ask AI
// --------------------------------------------------
// context is optional.
// Existing callers using ask(question) continue to work.
// --------------------------------------------------

const ask = (question, context = "") => {
  const cleanQuestion = question?.trim();

  const contextualQuestion = context?.trim()
    ? `${context.trim()}

User question:
${cleanQuestion}`
    : cleanQuestion;

  return api.post("/ai/ask", {
    question: contextualQuestion,
  });
};

// --------------------------------------------------
// Suggest Deductions
// --------------------------------------------------

const suggestDeductions = () => {
  return api.post("/ai/suggest-deductions");
};

// --------------------------------------------------
// Summarize Taxpayer
// --------------------------------------------------

const summarize = (userId) => {
  return api.post(`/ai/summarize/${userId}`);
};

// --------------------------------------------------
// Explain Tax Record
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