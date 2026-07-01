import api from "../api/axios";

export const getAllCertificates = () => {
    return api.get("/api/certificate");
};
export const getCertificateById = (id) => {
    return api.get(`/api/certificate/${id}`);
};
export const createCertificate = (data) => {
    return api.post("/api/certificate", data);
};
export const updateCertificate = (id, data) => {
    return api.put(`/api/certificate/${id}`, data);
};


export const deleteCertificate = (id) => {
    return api.delete(`/api/certificate/${id}`);
};