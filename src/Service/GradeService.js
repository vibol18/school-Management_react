
import api from "../api/axios";

export const getGrades = () => api.get("/api/grades");

export const getGradeById = (id) => api.get(`/api/grades/${id}`);

export const createGrade = (data) => api.post("/api/grades", data);

export const updateGrade = (id, data) => api.put(`/api/grades/${id}`, data);

export const deleteGrade = (id) => api.delete(`/api/grades/${id}`);
export const getStudentGrades = (studentId) => {
    return api.get(`/api/grades/student/${studentId}`);
};

export const getStudentAverage = (studentId) => {
    return api.get(`/api/grades/student/${studentId}/average`);
};