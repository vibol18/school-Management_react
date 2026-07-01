import api from "../api/axios";

export const getAllSchool = () => {
    return api.get("/api/school");
}
export const getSchoolById = (id) => {
    return api.get(`/api/school/${id}`);
}
export const createSchool = (schoolData) => {
    return api.post("/api/school", schoolData);
}
export const updateSchool = (id, schoolData) => {
    return api.put(`/api/school/${id}`, schoolData);
}
export const deleteSchool = (id) => {
    return api.delete(`/api/school/${id}`);
}