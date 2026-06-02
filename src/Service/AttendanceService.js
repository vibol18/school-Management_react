import api from "../api/axios";

export const showAllAttendance = () => {
    return api.get("/api/attendance");
};

export const markAllPresent = (subjectId) => {
    return api.post(
        `/api/attendance/mark-all-present/${subjectId}`
    );
};

export const createAttendance = (data) => {
    return api.post("/api/attendance", data);
};

export const showAttById = (id) => {
    return api.get(`/api/attendance/${id}`);
};

export const updateAttendance = (id, data) => {
    return api.put(`/api/attendance/${id}`, data);
};

export const deleteAttendance = (id) => {
    return api.delete(`/api/attendance/${id}`);
};