import api from "../api/axios";

// ទាញយកទិន្នន័យសិស្សទាំងអស់
export const studentAll = () =>
    api.get("/api/students");

// 💡 បានកែប្រែ៖ ប្តូរពី axios.get មកជា api.get ដើម្បីកុំឲ្យខុស Base URL ឬខ្វះ Token
export const getStudentsByClass = (classId) => {
    return api.get(`/api/students/class/${classId}`);
};

// បង្កើតទិន្នន័យសិស្សថ្មី
export const createStudent = (data) =>
    api.post("/api/students", data);

// កែប្រែទិន្នន័យសិស្ស
export const updateStudent = (id, data) =>
    api.put(`/api/students/${id}`, data);

// លុបទិន្នន័យសិស្ស
export const deleteStudent = (id) =>
    api.delete(`/api/students/${id}`);