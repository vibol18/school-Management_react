import api from "../api/axios";

export const showAllteacher = () => api.get("/api/teacher");
export const createTeacher = (data) => api.post("/api/teacher", data);
export const updateTeacher = (id, data) => api.put(`/api/teacher/${id}`, data);
export const deleteTeahcer = (id) => api.delete(`/api/teacher/${id}`);