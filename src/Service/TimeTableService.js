import api from "../api/axios";

export const getAllTimeTables = () => {
    return api.get("/api/timetable");
};

export const getTimeTableById = (id) => {
    return api.get(`/api/timetable/${id}`);
};

export const createTimeTable = (data) => {
    return api.post("/api/timetable", data);
};

export const updateTimeTable = (id, data) => {
    return api.put(`/api/timetable/${id}`, data);
};

export const deleteTimeTable = (id) => {
    return api.delete(`/api/timetable/${id}`);
};