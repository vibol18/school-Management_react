import api from "../api/axios";


export const studentAll = () =>
    api.get("/api/students");


export const getStudentsByClass = (classId) => {
    return api.get(`/api/students/class/${classId}`);
};
export const createStudent = (data) =>
    api.post("/api/students", data);

export const updateStudent = (id, data) =>
    api.put(`/api/students/${id}`, data);


export const deleteStudent = (id) =>
    api.delete(`/api/students/${id}`);