import React, { useEffect, useState } from "react";
import {
    showAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
} from "../Service/attendanceService";
import { studentAll } from "../Service/studentService";
import { subjectAll } from "../Service/SubjectService";

function Attendance() {
    const [attendances, setAttendances] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        id: null,
        studentId: "",
        subjectId: "",
        date: new Date().toISOString().split('T')[0],
        status: "PRESENT",
        remark: ""
    });

    useEffect(() => {
        initDashboard();
    }, []);

    const initDashboard = async () => {
        setLoading(true);
        await Promise.all([fetchAttendance(), fetchStudents(), fetchSubjects()]);
        setLoading(false);
    };

    const fetchAttendance = async () => {
        try { 
            const res = await showAllAttendance(); 
            setAttendances(res.data || []); 
        } catch (err) { 
            console.error(err); 
        }
    };

    const fetchStudents = async () => {
        try { 
            const res = await studentAll(); 
            setStudents(res.data || []); 
        } catch (err) { 
            console.error(err); 
        }
    };

    const fetchSubjects = async () => {
        try { 
            const res = await subjectAll(); 
            setSubjects(res.data || []); 
        } catch (err) { 
            console.error(err); 
        }
    };

    // Calculate live aggregates for the sub-header row
    const totalCount = attendances.length;
    const presentCount = attendances.filter(a => a.status === "PRESENT").length;
    const absentCount = attendances.filter(a => a.status === "ABSENT").length;
    const lateCount = attendances.filter(a => a.status === "LATE").length;
    
    const presentPercent = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;
    const absentPercent = totalCount ? Math.round((absentCount / totalCount) * 100) : 0;

    const openCreate = () => {
        setForm({ 
            id: null, 
            studentId: "", 
            subjectId: subjects[0]?.id || "", 
            date: new Date().toISOString().split('T')[0], 
            status: "PRESENT", 
            remark: "" 
        });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (a) => {
        setForm({
            id: a.id,
            studentId: a.studentId,
            subjectId: a.subjectId,  
            date: a.date,
            status: a.status,
            remark: a.remark || ""
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this attendance record?")) return;
        try { 
            await deleteAttendance(id); 
            await fetchAttendance(); 
        } catch (err) { 
            console.error(err); 
        }
    };

    // Fast inline status updating directly from row action triggers
    const handleQuickStatusChange = async (record, newStatus) => {
        const payload = {
            studentId: Number(record.studentId),
            subjectId: Number(record.subjectId),
            date: record.date,
            status: newStatus,
            remark: record.remark || ""
        };
        try {
            await updateAttendance(record.id, payload);
            await fetchAttendance();
        } catch (err) {
            console.error("Quick status update failed:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            studentId: Number(form.studentId),
            subjectId: Number(form.subjectId),
            date: form.date,
            status: form.status,
            remark: form.remark
        };

        try {
            if (isEdit) {
                await updateAttendance(form.id, payload);
            } else {
                await createAttendance(payload);
            }
            setIsOpen(false);
            await fetchAttendance();
        } catch (err) {
            console.error("Form Submission Error:", err.response?.data || err);
        }
    };

    // Filter list based on search bar value
    const filteredAttendances = attendances.filter(a => 
        a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id?.toString().includes(searchTerm)
    );

    // Dynamic initial helper fallback for profile views
    const getInitials = (name = "") => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* ── SCREENSHOT MAIN ACTION HEADER ── */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Grade 9-B Attendance — Oct 28, 2024 (History)
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-semibold">
                                <span className="text-slate-500">Total Students: <span className="text-slate-800 font-bold">{totalCount || 25}</span></span>
                                <span className="text-gray-300">|</span>
                                <span className="text-emerald-600">Present: {presentCount} ({presentPercent}%)</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-red-500">Absent: {absentCount} ({absentPercent}%)</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-amber-500">Late: {lateCount}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Add Attendance
                            </button>
                            <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition">
                                Mark All Present
                            </button>
                            <button className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.07 6.07 0 00-1-3.5M9 19h6a3 3 0 01-6 0z" /></svg>
                                Send Absent Alerts
                            </button>
                            <button className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Reports
                            </button>
                        </div>
                    </div>

                    {/* FILTER SEARCH BAR */}
                    <div className="relative max-w-xs">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Filter students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                    </div>
                </div>

                {/* ── RENDER MOCKUP DATATABLE ── */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-64 gap-3">
                            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-xs text-slate-400 font-medium">Loading ledger matrix...</span>
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-gray-100">
                                    <th className="w-12 pl-6 py-3"><input type="checkbox" className="rounded accent-blue-600" /></th>
                                    <th className="w-12 px-2 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Select</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Late (min)</th>
                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason/Note</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAttendances.map((a, index) => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition group">
                                        <td className="pl-6 py-3.5"><input type="checkbox" className="rounded accent-blue-600" /></td>
                                        <td className="px-2 py-3.5 text-xs font-medium text-slate-400">{index + 1}.</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center uppercase">
                                                    {getInitials(a.studentName)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{a.studentName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{a.subjectName || 'General History'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Status & Quick Action Buttons */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                {a.status === "PRESENT" ? (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Present
                                                    </span>
                                                ) : a.status === "ABSENT" ? (
                                                    <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Absent
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {a.status}
                                                    </span>
                                                )}
                                                
                                                {/* QUICK FLIP SWITCH CONTROLS */}
                                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition pl-1">
                                                    <button 
                                                        onClick={() => handleQuickStatusChange(a, "PRESENT")}
                                                        className="px-2 py-0.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-sm"
                                                        title="Quick Set Present"
                                                    >
                                                        ✓ Present
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQuickStatusChange(a, "ABSENT")}
                                                        className="px-2 py-0.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded font-medium shadow-sm"
                                                        title="Quick Set Absent"
                                                    >
                                                        ✕ Absent
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Min Delay column field */}
                                        <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                                            {a.status === "LATE" ? "10 min" : "0"}
                                        </td>
                                        
                                        {/* Inline Reason Note field rendering mockup template elements */}
                                        <td className="px-4 py-3.5">
                                            <input 
                                                type="text" 
                                                readOnly
                                                value={a.remark || ""} 
                                                placeholder="—"
                                                className="bg-transparent border-none text-xs text-slate-500 w-full max-w-xs focus:outline-none truncate"
                                            />
                                        </td>

                                        {/* Operational Table Crud Row Trigger Group UI */}
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(a)}
                                                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(a.id)}
                                                    className="border border-red-100 hover:bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold transition"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                {isEdit ? "Modify Record Parameters" : "Create Attendance Transaction"}
                            </h2>
                            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student</label>
                                <select
                                    value={form.studentId}
                                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName} (ID: {s.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject Track</label>
                                <select
                                    value={form.subjectId}
                                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Metric Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                    >
                                        <option value="PRESENT">PRESENT</option>
                                        <option value="ABSENT">ABSENT</option>
                                        <option value="LATE">LATE</option>
                                        <option value="PERMISSION">PERMISSION</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reason Note/Remark</label>
                                <textarea
                                    value={form.remark}
                                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                    placeholder="Doctor appointment, late bus, etc."
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
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                    {isEdit ? "Apply Changes" : "Save Log"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Attendance;