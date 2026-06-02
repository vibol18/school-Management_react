import { data } from "react-router-dom"
import api from "../api/axios"

export const getAllDepartment = () =>{
    return api.get("/api/departments")
}
export const createDepartment =(data) =>{
    return api.post("/api/departments",data)
}
export const updateDepartment = (id,data) =>{
    return api.put(`/api/departments/${id}`,data)
}
export const deleteDepartment = (id) =>{
   return api.delete(`/api/department/${id}`)
}