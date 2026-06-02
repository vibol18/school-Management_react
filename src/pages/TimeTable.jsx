import { useEffect, useState } from "react";

import {
    getAllTimeTables,
    createTimeTable,
    updateTimeTable,
    deleteTimeTable
} from "../Service/TimeTableService";

import { getClasses } from "../Service/classService";
import { getAllCourses } from "../Service/courseService";

function TimeTable() {
    // =========================
    // STATE MANAGEMENT
    // =========================
    const [timeTables, setTimeTables] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [selectedClass, setSelectedClass] = useState("All");

    const [form, setForm] = useState({
        id: null,
        classId: "",
        courseId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        room: ""
    });

    // Hardcoded structure definitions for rendering the grid matrix
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = [
        { label: "08:00 - 09:30", start: "08:00" },
        { label: "10:00 - 11:30", start: "10:00" },
        { label: "13:30 - 15:00", start: "13:30" },
        { label: "15:15 - 16:45", start: "15:15" }
    ];

    // Dynamic Tailwind color tags based on course names or IDs to look visually unique
    const getColorClass = (courseId) => {
        const colors = [
            "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/70",
            "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/70",
            "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70",
            "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/70",
            "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70",
            "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/70"
        ];
        return colors[Number(courseId) % colors.length] || colors[0];
    };

    // =========================
    // EFFECTS & DATA FETCHING
    // =========================
    useEffect(() => {
        fetchTimeTables();
        fetchClasses();
        fetchCourses();
    }, []);

    const fetchTimeTables = async () => {
        try {
            const res = await getAllTimeTables();
            setTimeTables(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await getClasses();
            setClasses(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await getAllCourses();
            setCourses(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    // =========================
    // FORM CONTROL ACTIONS
    // =========================
    const openCreate = (defaultDay = "", defaultStart = "") => {
        setForm({
            id: null,
            classId: selectedClass !== "All" ? selectedClass : "",
            courseId: "",
            dayOfWeek: defaultDay,
            startTime: defaultStart,
            endTime: "",
            room: ""
        });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (t, e) => {
        e.stopPropagation(); // Stop parent clicks when clicking the explicit inner edit label
        setForm({
            id: t.id,
            classId: t.classId || "",
            courseId: t.courseId || "",
            dayOfWeek: t.dayOfWeek || "",
            startTime: t.startTime || "",
            endTime: t.endTime || "",
            room: t.room || ""
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Delete this timetable entry?")) return;
        try {
            await deleteTimeTable(id);
            fetchTimeTables();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateTimeTable(form.id, form);
            } else {
                await createTimeTable(form);
            }
            setIsOpen(false);
            fetchTimeTables();
        } catch (error) {
            console.log(error);
        }
    };

    // =========================
    // MATRIX MATRIX GRID FILTER LOGIC
    // =========================
    const getLessonForSlot = (day, slotStart) => {
        return timeTables.find((t) => {
            const matchDay = t.dayOfWeek?.toLowerCase() === day.toLowerCase();
            const matchTime = t.startTime?.startsWith(slotStart);
            const matchClass = selectedClass === "All" || String(t.classId) === String(selectedClass);
            return matchDay && matchTime && matchClass;
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* ── HEADER CONTROL PANEL ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f1e3c] tracking-tight">Time Table Matrix</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Weekly master scheduling configuration system layout</p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        {/* Dynamic Class Filter Dropdown */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Class Filter:</span>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                            >
                                <option value="All">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => openCreate("", "")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Schedule
                        </button>
                    </div>
                </div>

                {/* ── VISUAL SCHEDULE MATRIX GRID ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center text-sm font-medium text-gray-400">
                            Loading master database entries...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse table-fixed min-w-[1000px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-100">
                                        <th className="w-36 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center bg-slate-50/50">
                                            Time Slot
                                        </th>
                                        {daysOfWeek.map((day) => (
                                            <th key={day} className="p-4 text-xs font-bold text-slate-800 tracking-wide text-center">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {timeSlots.map((slot) => (
                                        <tr key={slot.label} className="group">
                                            {/* Time column label spacing block */}
                                            <td className="p-4 text-center bg-slate-50/30 border-r border-gray-50 group-hover:bg-slate-50 transition duration-150">
                                                <span className="text-xs font-extrabold text-slate-700 block font-mono">
                                                    {slot.label.split(" - ")[0]}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                                    {slot.label.split(" - ")[1]}
                                                </span>
                                            </td>

                                            {/* Mapping Columns out dynamically to grid matrix indices */}
                                            {daysOfWeek.map((day) => {
                                                const lesson = getLessonForSlot(day, slot.start);
                                                return (
                                                    <td key={day} className="p-2 border-r border-slate-100 align-top relative min-h-[115px]">
                                                        {lesson ? (
                                                            /* Populated Matrix Grid Card Frame */
                                                            <div className={`p-3 rounded-xl border transition duration-200 h-full flex flex-col justify-between space-y-3 relative group/card ${getColorClass(lesson.courseId)}`}>
                                                                <div>
                                                                    <div className="flex items-start justify-between gap-1">
                                                                        <h4 className="text-xs font-bold line-clamp-2 leading-tight">
                                                                            {lesson.courseName || `Course ID: ${lesson.courseId}`}
                                                                        </h4>
                                                                        <span className="text-[9px] bg-white/70 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-tight shrink-0">
                                                                            {lesson.room || "N/A"}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[10px] opacity-80 font-semibold mt-1.5 flex items-center gap-1">
                                                                        <span className="bg-black/5 px-1 py-0.5 rounded text-[9px]">
                                                                            {lesson.className || `Class: ${lesson.classId}`}
                                                                        </span>
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center justify-between pt-1.5 border-t border-black/5 text-[9px] font-bold opacity-70">
                                                                    <span className="font-mono">{lesson.startTime} - {lesson.endTime}</span>
                                                                    
                                                                    {/* Action triggers built cleanly inside element cards */}
                                                                    <div className="flex gap-1 ml-2">
                                                                        <button 
                                                                            onClick={(e) => handleEdit(lesson, e)}
                                                                            className="px-1.5 py-0.5 bg-white/80 hover:bg-white text-slate-700 rounded border border-black/5"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => handleDelete(lesson.id, e)}
                                                                            className="px-1.5 py-0.5 bg-red-100/80 hover:bg-red-200 text-red-700 rounded border border-red-200/20"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Clickable interactive blueprint slot layout block */
                                                            <div 
                                                                onClick={() => openCreate(day, slot.start)}
                                                                className="w-full h-full min-h-[85px] rounded-xl border border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50/70 transition duration-150 flex items-center justify-center group/cell cursor-pointer"
                                                            >
                                                                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover/cell:opacity-100 transition duration-150">
                                                                    + Assign {day}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── UNIFIED CONFIGURATION INTERACTION MODAL ── */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                                {isEdit ? "Modify Allocations" : "Configure Period Allocation"}
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* SELECT TARGET TARGET CLASS */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Class</label>
                                <select
                                    value={form.classId}
                                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    required
                                >
                                    <option value="">Select Target Class Setup</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SELECT ASSIGNED COURSE */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Course</label>
                                <select
                                    value={form.courseId}
                                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    required
                                >
                                    <option value="">Select Curricular Subject</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule Day</label>
                                <select
                                    value={form.dayOfWeek}
                                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    required
                                >
                                    <option value="">Select Matrix Target Day</option>
                                    {daysOfWeek.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                           
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Hour</label>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Hour</label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                           
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Designated Room</label>
                                <input
                                    type="text"
                                    value={form.room}
                                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                                    placeholder="e.g. Lab 01, Room 402"
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    required
                                />
                            </div>

                            {/* MODAL ACTION INTERFACES BUTTONS */}
                            <div className="flex gap-3 pt-3">
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
                                    {isEdit ? "Apply Changes" : "Confirm Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TimeTable;