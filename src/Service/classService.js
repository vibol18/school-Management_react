import api from "../api/axios";


export const getClasses = () => {
  return api.get("/api/classes");
};

export const getClassById = (id) => {
  return api.get(`/api/classes/${id}`);
};
export const createClass = (data) => {
  return api.post("/api/classes", data);
};

export const updateClass = (id, data) => {
  return api.put(`/api/classes/${id}`, data);
};


export const deleteClass = (id) => {
  return api.delete(`/api/classes/${id}`);
};