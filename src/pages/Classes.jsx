import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {getClasses, createClass, updateClass, deleteClass} from "../Service/classService";

function Classes() {
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [search, setSearch] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState({
        id: null,
        name: "",
        roomNumber: "",
        section: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Class Modules data payload
            const res = await getClasses();
            const rawData = Array.isArray(res.data) ? res.data : res.data?.content || [];

            // 2. Fetch all scheduled exam records from the database endpoint
            let allExams = [];
            try {
                const examRes = await axios.get("http://localhost:8082/api/exams");
                allExams = examRes.data || [];
            } catch (e) {
                console.error("Failed to load global exams manifest from server architecture:", e);
            }

            // 3. Thread-safe dynamic aggregation mapping pipeline
            const updatedClasses = await Promise.all(
                rawData.map(async (c) => {
                    let studentCount = 0;
                    try {
                        const studentRes = await axios.get(`http://localhost:8082/api/students/class/${c.id}`);
                        studentCount = studentRes.data ? studentRes.data.length : 0;
                    } catch (error) {
                        studentCount = 0;
                    }

                    // 🛠️ MULTI-STRATEGY MATCH FIX: Checks for both relational object tracking keys or flat primitive ID maps
                    const classExams = allExams.filter((exam) => {
                        const matchesNestedObject = exam.classRoom && exam.classRoom.id === c.id;
                        const matchesFlatForeignId = Number(exam.classRoomId) === c.id;
                        return matchesNestedObject || matchesFlatForeignId;
                    });

                    return {
                        ...c,
                        studentCount: studentCount,
                        maxCapacity: 25,
                        exams: classExams,
                    };
                })
            );

            setClasses(updatedClasses);
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    // OPEN CREATE
    const openCreate = () => {
        setForm({id: null, name: "", roomNumber: "", section: ""});
        setIsEdit(false);
        setIsOpen(true);
    };

    // EDIT
    const handleEdit = (item) => {
        setForm(item);
        setIsEdit(true);
        setIsOpen(true);
    };

    // DELETE
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this track context class?")) {
            try {
                await deleteClass(id);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateClass(form.id, form);
            } else {
                await createClass(form);
            }
            setIsOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = classes.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#f8fafc] font-sans">
            {/* HEADER SECTION */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f1e3c] tracking-tight">Classes</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Manage academic tracks, room allocations, and roster density metrics
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Class
                </button>
            </div>

            {/* SEARCH INTERFACE BAR */}
            <input
                className="border border-gray-200 bg-white rounded-xl p-2.5 w-full mb-6 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-xs transition-all"
                placeholder="Search class track by descriptive name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* BOX GRID LAYOUT */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 shadow-xs text-xs font-medium">
                    No active classroom modules match your current filter rules.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => navigate(`/classes/${c.id}/students`)}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative flex flex-col justify-between cursor-pointer"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                        ID: {c.id}
                                    </span>
                                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                                        Sec: {c.section || "N/A"}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-800 mb-1 truncate">{c.name}</h3>

                                <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                                    <span className="font-bold text-gray-400">Room:</span>
                                    <span className="font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded font-mono text-[11px]">
                                        {c.roomNumber || "N/A"}
                                    </span>
                                </p>

                                {/* ── EXAMS DISPLAY BOX SECTION ── */}
                                <div className="mt-2 mb-4" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                                        Classroom Assessments ({c.exams ? c.exams.length : 0})
                                    </span>

                                    {c.exams && c.exams.length > 0 ? (
                                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                            {c.exams.map((exam) => (
                                                <div
                                                    key={exam.id}
                                                    className="bg-amber-50/80 border border-amber-100 rounded-xl p-2 flex flex-col gap-0.5"
                                                >
                                                    <div className="flex justify-between items-start gap-1">
                                                        <span className="text-xs font-bold text-amber-950 truncate max-w-[70%]">
                                                            {exam.title}
                                                        </span>
                                                        <span className="text-[10px] font-mono bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded-md shrink-0">
                                                            {exam.totalMarks} Marks
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-amber-700/80 font-medium">
                                                        {exam.examDate}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[11px] text-gray-400 italic bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                                            No exams mapped to this module track
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CARD FOOTER */}
                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
                                <div
                                    className="flex items-center gap-1.5 text-slate-500"
                                    title="Enrolled Students / Maximum Capacity"
                                >
                                    <svg
                                        className="w-4 h-4 text-slate-400 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                    <span className="text-xs font-mono font-extrabold text-slate-700">
                                        {c.studentCount}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-bold">/</span>
                                    <span className="text-[11px] text-gray-400 font-semibold font-mono">
                                        {c.maxCapacity}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(c);
                                        }}
                                        className="bg-slate-50 hover:bg-amber-500 text-slate-700 hover:text-white border border-slate-100 hover:border-amber-500 p-1.5 rounded-xl text-xs font-bold transition-all duration-150"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(c.id);
                                        }}
                                        className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-100 hover:border-red-100 p-1.5 rounded-xl transition-all duration-150"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                {isEdit ? "Update Class Properties" : "Provision New Class Allocation"}
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-sm">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                    Class Name
                                </label>
                                <input
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                    placeholder="e.g. IT Fundamentals"
                                    value={form.name}
                                    required
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                        Room Number
                                    </label>
                                    <input
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                        placeholder="e.g. IT101"
                                        value={form.roomNumber}
                                        onChange={(e) => setForm({...form, roomNumber: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                        Section Shift
                                    </label>
                                    <input
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                        placeholder="e.g. Morning / Evening"
                                        value={form.section}
                                        onChange={(e) => setForm({...form, section: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                    {isEdit ? "Update Module" : "Confirm Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Classes;
