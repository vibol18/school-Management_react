import api from "../api/axios";

export const subjectAll = () => {
    return api.get("/api/subjects");
};

export const createSubject = (data) => {
    return api.post("/api/subjects", data);
};

export const updateSubject = (id, data) => {
    return api.put(`/api/subjects/${id}`, data);
};

export const deleteSubject = (id) => {
    return api.delete(`/api/subjects/${id}`);
};