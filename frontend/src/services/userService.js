import api from "./api";

const getAll = ({ page = 0, size = 100, search = "" } = {}) =>
  api.get("/users", {
    params: {
      page,
      size,
      ...(search.trim() && { search: search.trim() }),
    },
  });

const getById = (id) => api.get(`/users/${id}`);

const create = (data) => api.post("/users", data);

const update = (id, data) => api.put(`/users/${id}`, data);

const remove = (id) => api.delete(`/users/${id}`);

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};