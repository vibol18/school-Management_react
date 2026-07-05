import api from "../api/axios";

export const createCourse = (data) => {
  return api.post("/api/courses", data);
};

export const getAllCourses = async () => {
  try {
    return await api.get("/api/courses");
  } catch (error) {
    console.warn("Unable to fetch courses from API:", error.message);
    return { data: [] };
  }
};

export const getCourseById = (id) => {
  return api.get(`/api/courses/${id}`);
};

export const updateCourse = (id, data) => {
  return api.put(`/api/courses/${id}`, data);
};

export const deleteCourse = (id) => {
  return api.delete(`/api/courses/${id}`);
};