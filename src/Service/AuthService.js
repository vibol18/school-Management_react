import api from "../api/axios";
import { API_ROOT, GOOGLE_AUTH_PATH } from "../api/config";

export const login = (data) => {
    return api.post("/api/auth/login", data);
};
export const register = (data) => {
    return api.post("/api/auth/register", data);
};
export const getGoogleAuthUrl = () => `${API_ROOT}${GOOGLE_AUTH_PATH}`;
