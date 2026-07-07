import api from "../api/axios";

export const getAllSchool = () => {
  return api.get("/schools");
};

export const getSchoolById = (id) => {
  return api.get(`/schools/${id}`);
};

export const createSchool = (schoolData) => {
  return api.post("/schools", schoolData);
};

export const updateSchool = (id, schoolData) => {
  return api.put(`/schools/${id}`, schoolData);
};

export const deleteSchool = (id) => {
  return api.delete(`/schools/${id}`);
};