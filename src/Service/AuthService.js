import api from "../api/axios";


export const login = (data) => {
    return api.post("/api/auth/login", data);
};
export const register = (data) => {
    return api.post("/api/auth/register", data);
};