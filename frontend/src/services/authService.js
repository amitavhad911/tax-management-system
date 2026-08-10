import api from "./api";
const login = (credentials) => api.post("/auth/login", credentials);
export default { login };
