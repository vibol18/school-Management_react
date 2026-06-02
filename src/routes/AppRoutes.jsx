import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import MainLayout from "../layout/Mainlayout";

import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Classes from "../pages/Classes";
import Setting from "../pages/Setting";
import TimeTable from "../pages/TimeTable";
import Department from "../pages/Department";
import Attendance from "../pages/Attendance";


import ProtectedRoute from "../components/ProtectedRoute";
import Course from "../pages/Course";
import Grades from "../pages/Grades";
import Subject from "../pages/Subject";
import Finance from "../pages/Finance";
import ClassStudents from "../pages/ClassStudents";
import Exams from "../pages/Exam";
import Register from "../pages/Register";
import Certificate from "../pages/Certificate";

function AppRoutes() {

  return (
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/departments" element={<Department />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/course" element={<Course/>}/>
        <Route path="/grades" element={<Grades/>}/>
        <Route path="/subjects" element={<Subject/>}/>
        <Route path="/finance" element={<Finance/>}/>
        <Route path="/classes/:id/students" element={<ClassStudents />}/>
        <Route path="/exams" element={<Exams/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/certificates" element={<Certificate/>}/>
      </Route>
    </Routes>
  );
}

export default AppRoutes;