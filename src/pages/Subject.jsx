import React, { useEffect, useState } from 'react';
import { createSubject, deleteSubject, subjectAll, updateSubject } from '../Service/SubjectService';

import { getAllCourses } from '../Service/courseService';
import { showAllteacher } from '../Service/teacherService'; 

function Subject() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);   
  const [teachers, setTeachers] = useState([]);   
  
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    courseId: "",
    teacherId: "",
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubjectsList();
    fetchDropdownData();
  }, []);

  const fetchSubjectsList = async () => {
    try {
      const res = await subjectAll();
      setSubjects(Array.isArray(res) ? res : res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      
      if (typeof getAllCourses === 'function') {
        const courseRes = await getAllCourses();
        setCourses(Array.isArray(courseRes) ? courseRes : courseRes.data || []);
      }
      
      
      if (typeof showAllteacher === 'function') {
        const teacherRes = await showAllteacher();
        setTeachers(Array.isArray(teacherRes) ? teacherRes : teacherRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching drop-down options:", error);
    }
  };

  const openCreate = () => {
    setForm({ 
      id: null,
      name: "",
      description: "",
      courseId: "",
      teacherId: ""
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEdit = (sub) => {
    setForm({
      id: sub.id,
      name: sub.name,
      description: sub.description || "",
      courseId: sub.course?.id || sub.courseId || "",
      teacherId: sub.teacher?.id || sub.teacherId || ""
    });
    setIsEdit(true);
    setIsOpen(true); 
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return;
    try {
      await deleteSubject(id);
      fetchSubjectsList();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateSubject(form.id, form);
      } else {
        await createSubject(form);
      }
      fetchSubjectsList();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving subject:", error);
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = 
      (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0f1e3c] tracking-tight">Subject Framework</h1>
            <p className="text-xs text-gray-400 mt-0.5">Configure individual academic curriculum modules</p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-blue-500 shadow-sm"
            />

            <button 
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Subject
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 tracking-wide font-mono">
                    ID: {sub.id}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-800 line-clamp-1">{sub.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {sub.description || "No curriculum course synopsis description has been set up."}
                </p>
              </div>

              {}
              <div className="pt-3 border-t border-gray-50 flex flex-col gap-1 text-[11px] font-medium text-gray-400">
                <div>Course: <span className="text-slate-700 font-bold">{sub.courseName || sub.course?.name || 'Unassigned'}</span></div>
                <div>Teacher: <span className="text-slate-700 font-bold">{sub.teacherName || sub.teacher?.name || 'Unassigned'}</span></div>
              </div>

              {}
              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => openEdit(sub)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-100"
                >
                  Configure
                </button>
                <button 
                  onClick={() => handleDelete(sub.id)}
                  className="border border-red-50 hover:bg-red-50 text-red-600 p-1.5 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {isEdit ? "Edit Subject Configuration" : "Create New Subject Track"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject Title</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Organic Chemistry"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Course Assignment</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition appearance-none"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Assigned Teacher</label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition appearance-none"
                  >
                    <option value="">-- Choose Teacher --</option>
                    {teachers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name || (item.firstName ? `${item.firstName} ${item.lastName || ''}` : `ID: ${item.id}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Syllabus Overview Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline key academic focuses..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {isEdit ? "Update Module" : "Confirm Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Subject;