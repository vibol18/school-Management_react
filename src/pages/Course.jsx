import React, { useEffect, useState } from 'react';
import { 
  getAllCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../Service/courseService';

function Course() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    imageUrl: "",
    level: "Beginner",
    duration: "",
    price: 0,
    description: "",
    active: true
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      setCourses(res.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      id: null,
      name: "",
      imageUrl: "",
      level: "Beginner",
      duration: "",
      price: 0,
      description: "",
      active: true
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleEdit = (c) => {
    setForm({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl || "",
      level: c.level || "Beginner",
      duration: c.duration || "",
      price: c.price || 0,
      description: c.description || "",
      active: c.active !== undefined ? c.active : true
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course permanently?")) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      imageUrl: form.imageUrl,
      level: form.level,
      duration: form.duration,
      price: Number(form.price),
      description: form.description,
      active: form.active
    };

    try {
      if (isEdit) {
        await updateCourse(form.id, payload);
      } else {
        await createCourse(payload);
      }
      setIsOpen(false);
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 p-6 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Course Catalogue</h1>
            <p className="text-xs text-gray-500">Manage and organize available academic courses and materials</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-white border border-gray-300 rounded w-64 focus:outline-none"
              />
            </div>
            <button
              onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Course
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-2">
            <span className="text-xs text-gray-500 font-medium">Loading courses syllabus...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded border border-gray-300 p-12 text-center">
            <p className="text-sm text-gray-500 font-medium">No courses found matching criteria.</p>
          </div>
        ) : (
          /* COURSE CARD GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div key={c.id} className="bg-white rounded border border-gray-300 overflow-hidden flex flex-col">
                
                {/* COURSE COVER IMAGE */}
                <div className="h-44 w-full bg-gray-200 relative">
                  <img 
                    src={c.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"} 
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      c.level === 'Advanced' ? 'bg-red-100 text-red-800 border-red-200' :
                      c.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    }`}>
                      {c.level || 'Beginner'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${c.active ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-200 text-gray-700 border-gray-300'}`}>
                      {c.active ? 'Active' : 'Archived'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold">
                    ${c.price ? c.price.toFixed(2) : '0.00'}
                  </div>
                </div>

                {/* CONTENT TRACK CARD BODY */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-bold text-sm text-gray-900">{c.name}</h2>
                    <p className="text-xs text-gray-500 leading-normal">{c.description || "No program overview synopsis has been specified for this syllabus course tract yet."}</p>
                    
                    {/* TIMING CONFIGURATION META */}
                    <div className="flex items-center text-gray-500 text-[11px] gap-1 pt-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Duration: <span className="text-gray-900 font-bold">{c.duration || 'N/A'}</span>
                    </div>
                  </div>

                  {/* CURRICULUM DISPLAY */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Curriculum Scope</p>
                    <div className="flex flex-wrap gap-1">
                      {c.subjects && c.subjects.length > 0 ? (
                        c.subjects.map((sub, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No assigned subjects modules</span>
                      )}
                    </div>
                  </div>

                  {/* CONTROL BAR INTERFACES */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <button 
                      onClick={() => handleEdit(c)}
                      className="flex-1 border border-gray-300 text-gray-700 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Modify
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="border border-red-300 text-red-600 p-1.5 rounded text-xs font-bold"
                      title="Remove Course Track"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* OPERATIONAL CRUD MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded w-full max-w-md overflow-hidden border border-gray-300">
            
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase">
                {isEdit ? "Edit Course Information" : "Create New Course Record"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Course Title</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Advanced Mathematics 101"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Target Skill Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Duration Block</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g., 3 Months, 45 Hours"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tuition Pricing ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Catalogue Visibility</label>
                  <select
                    value={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
                  >
                    <option value="true">Active / Published</option>
                    <option value="false">Archived / Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Description / Overview</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline course criteria modules..."
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded text-xs font-bold"
                >
                  {isEdit ? "Update Track" : "Publish Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Course;