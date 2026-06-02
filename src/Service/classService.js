import api from "../api/axios";

// GET ALL CLASSES
export const getClasses = () => {
  return api.get("/api/classes");
};

// GET CLASS BY ID
export const getClassById = (id) => {
  return api.get(`/api/classes/${id}`);
};

// CREATE CLASS
export const createClass = (data) => {
  return api.post("/api/classes", data);
};

// UPDATE CLASS
export const updateClass = (id, data) => {
  return api.put(`/api/classes/${id}`, data);
};

// DELETE CLASS
export const deleteClass = (id) => {
  return api.delete(`/api/classes/${id}`);
};