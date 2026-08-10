import api from "./api";

const compute = (data) => {
  return api.post("/tax/compute", data);
};

const getById = (id) => {
  return api.get(`/tax/${id}`);
};

const getHistory = (userId) => {
  return api.get(`/tax/history/${userId}`);
};

const update = (id, data) => {
  return api.put(`/tax/${id}`, data);
};

const remove = (id) => {
  return api.delete(`/tax/${id}`);
};

export default {
  compute,
  getById,
  getHistory,
  update,
  remove,
};
