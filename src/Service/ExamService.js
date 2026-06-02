import api from "../api/axios";

export const createExam = (data) => {
  return api.post("/api/exams", data);
};

export const getExams = () => {
  return api.get("/api/exams");
};
export const updateExam = (id, data) => {
  return api.put(`/api/exams/${id}`, data);
};

export const deleteExam = (id) => {
  return api.delete(`/api/exams/${id}`);
};