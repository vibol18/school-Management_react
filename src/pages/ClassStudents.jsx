import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    showAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    markAllPresent // ✅ Added clean backend sync action
} from '../Service/AttendanceService';

import { getStudentsByClass } from "../Service/studentService";
import { subjectAll } from "../Service/SubjectService";

function ClassStudents() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [attendances, setAttendances] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        initDashboard();
    }, [id]);

    const initDashboard = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchAttendance(),
                fetchStudents(),
                fetchSubjects()
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
            const res = await getStudentsByClass(id);
            setStudents(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await subjectAll();
            const data = res.data || [];
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0].id.toString());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getMatchRecord = (studentId) => {
        return attendances.find(
            (a) =>
                a.studentId === studentId &&
                a.date === selectedDate &&
                (!selectedSubject || a.subjectId.toString() === selectedSubject)
        );
    };

    const handleToggleStatus = async (studentId, currentAttendance, newStatus) => {
        if (!selectedSubject) {
            alert("Please select a subject first.");
            return;
        }

        const payload = {
            studentId: Number(studentId),
            subjectId: Number(selectedSubject),
            date: selectedDate,
            status: newStatus,
            remark: currentAttendance?.remark || ""
        };

        try {
            if (currentAttendance) {
                await updateAttendance(currentAttendance.id, payload);
            } else {
                await createAttendance(payload);
            }
            await fetchAttendance();
        } catch (err) {
            console.error(err);
            alert("Failed to record attendance.");
        }
    };

    // ✅ OPTIMIZED: Unified backend 'Mark All Present' action wrapper
    const handleMarkAllPresent = async () => {
        if (!selectedSubject) {
            alert("Please select a subject first.");
            return;
        }

        if (!window.confirm("Are you sure you want to mark all students present for this class session?")) return;

        try {
            setLoading(true);
            // Executes single performance-friendly endpoint matching your dashboard controller
            await markAllPresent(Number(selectedSubject));
            await fetchAttendance();
        } catch (err) {
            console.error("Global presentation adjustment execution failed:", err);
            alert("Could not complete requested database update operational sync step.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (attendanceId) => {
        if (!window.confirm("Are you sure you want to clear this attendance record?")) return;
        try {
            await deleteAttendance(attendanceId);
            await fetchAttendance();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredStudents = students.filter((s) => {
        const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            s.id?.toString().includes(searchTerm)
        );
    });

    // Metrics
    const totalCount = students.length;
    const currentAttendanceSlice = students.map(s => getMatchRecord(s.id)).filter(Boolean);
    const presentCount = currentAttendanceSlice.filter(a => a.status === "PRESENT").length;
    const absentCount = currentAttendanceSlice.filter(a => a.status === "ABSENT").length;
    const lateCount = currentAttendanceSlice.filter(a => a.status === "LATE").length;
    const unmarkedCount = totalCount - currentAttendanceSlice.length;

    const getInitials = (firstName = "", lastName = "") => {
        return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "ST";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-600">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* BACK BUTTON */}
                        <button
                            onClick={() => navigate("/classes")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-2 rounded-xl shadow-sm transition-all duration-150 shrink-0"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Classes
                        </button>

                        {/* Breadcrumb divider */}
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Class Attendance Hub
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Track daily academic performance metrics and log student presence status.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* ✅ FIXED: Correctly referenced optimized hook handler */}
                        <button
                            onClick={handleMarkAllPresent}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
                        >
                            Mark All Present
                        </button>

                        <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.07 6.07 0 00-1-3.5M9 19h6a3 3 0 01-6 0z" />
                            </svg>
                            Notify Absentees
                        </button>
                    </div>
                </div>

                {/* ── METRIC CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {[
                        { title: "Total Roll",  value: totalCount,    color: "text-slate-900",   bg: "bg-white",         border: "border-slate-100" },
                        { title: "Present",     value: presentCount,  color: "text-emerald-600", bg: "bg-emerald-50/40", border: "border-emerald-100/70" },
                        { title: "Absent",      value: absentCount,   color: "text-rose-600",    bg: "bg-rose-50/40",    border: "border-rose-100/70" },
                        { title: "Late",        value: lateCount,     color: "text-amber-600",   bg: "bg-amber-50/50",   border: "border-amber-100/70" },
                        { title: "Unmarked",    value: unmarkedCount, color: "text-slate-400",   bg: "bg-slate-100/30",  border: "border-slate-200/50" },
                    ].map((card, i) => (
                        <div key={i} className={`${card.bg} ${card.border} border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200`}>
                            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{card.title}</p>
                            <p className={`text-2xl font-black ${card.color} mt-1`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── MAIN TABLE CARD ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    {/* FILTERS ROW */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
                            <div className="relative">
                                <label className="absolute -top-2 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wide z-10">
                                    Subject
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <label className="absolute -top-2 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wide z-10">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                                />
                            </div>
                        </div>

                        {/* SEARCH */}
                        <div className="relative max-w-xs w-full">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-72 gap-3 bg-white">
                                <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <span className="text-xs text-slate-400 font-medium tracking-wide">Loading students...</span>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-16 bg-white">
                                <p className="text-sm font-medium text-slate-400">No students found</p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="w-14 pl-6 py-3.5 text-center">#</th>
                                        <th className="px-4 py-3.5">Student</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Subject</th>
                                        <th className="px-4 py-3.5">Remark</th>
                                        <th className="px-6 py-3.5 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100/80 text-xs">
                                    {filteredStudents.map((student, index) => {
                                        const attendanceRecord = getMatchRecord(student.id);
                                        const activeSubjectName = subjects.find(s => s.id.toString() === selectedSubject)?.name || "—";

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/40 transition-colors group">
                                                {/* INDEX */}
                                                <td className="pl-6 py-4 text-center font-semibold text-slate-400">
                                                    {String(index + 1).padStart(2, "0")}
                                                </td>

                                                {/* STUDENT */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center justify-center shrink-0 shadow-sm">
                                                            {getInitials(student.firstName, student.lastName)}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-slate-900 block group-hover:text-blue-600 transition-colors">
                                                                {student.firstName} {student.lastName}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                                                                ID: #{student.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* STATUS + QUICK ACTIONS */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {attendanceRecord?.status === "PRESENT" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present
                                                            </span>
                                                        )}
                                                        {attendanceRecord?.status === "ABSENT" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-rose-50 text-rose-700 border border-rose-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent
                                                            </span>
                                                        )}
                                                        {attendanceRecord?.status === "LATE" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Late
                                                            </span>
                                                        )}
                                                        {!attendanceRecord && (
                                                            <span className="text-slate-300 font-medium italic text-[11px]">Unmarked</span>
                                                        )}

                                                        {/* HOVER QUICK-ACTION BUTTONS */}
                                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-150">
                                                            <button
                                                                onClick={() => handleToggleStatus(student.id, attendanceRecord, "PRESENT")}
                                                                className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg shadow-sm transition"
                                                            >
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(student.id, attendanceRecord, "ABSENT")}
                                                                className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg shadow-sm transition"
                                                            >
                                                                Absent
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(student.id, attendanceRecord, "LATE")}
                                                                className="px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg shadow-sm transition"
                                                            >
                                                                Late
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* SUBJECT */}
                                                <td className="px-4 py-4 font-medium text-slate-500">
                                                    {activeSubjectName}
                                                </td>

                                                {/* REMARK */}
                                                <td className="px-4 py-4 text-slate-400">
                                                    <span className="block max-w-[180px] truncate font-medium">
                                                        {attendanceRecord?.remark || "—"}
                                                    </span>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-6 py-4 text-right">
                                                    {attendanceRecord ? (
                                                        <button
                                                            onClick={() => handleDelete(attendanceRecord.id)}
                                                            className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
                                                        >
                                                            Clear
                                                        </button>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-300">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClassStudents;