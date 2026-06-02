



export const getGrades = () => axios.get("/api/grades");

export const getGradeById = (id) => axios.get(`/api/grades/${id}`);

export const createGrade = (data) => axios.post("/api/grades",data);

export const updateGrade = (id, data) =>
  axios.put(`/api/grades/${id}`, data);

export const deleteGrade = (id) => axios.delete(`/api/grades/${id}`);