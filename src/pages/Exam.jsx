import React, {useState, useEffect} from "react";
import {getClasses} from "../Service/classService";
import {getExams, createExam, updateExam, deleteExam} from "../Service/ExamService";
import {subjectAll} from "../Service/SubjectService";

function Exams() {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classRooms, setClassRooms] = useState([]);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [form, setForm] = useState({
        id: null,
        title: "",
        subjectId: "",
        classRoomId: "",
        examDate: "",
        totalMarks: "",
    });

    useEffect(() => {
        fetchExams();
        fetchSubjects();
        fetchClassData();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await getExams();
            setExams(res.data || []);
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

    const fetchClassData = async () => {
        try {
            const res = await getClasses();
            const rawData = Array.isArray(res.data) ? res.data : res.data?.content || [];
            setClassRooms(rawData);
        } catch (err) {
            console.error("Error fetching classes in Exam page:", err);
        }
    };

    const openCreate = () => {
        setForm({id: null, title: "", subjectId: "", classRoomId: "", examDate: "", totalMarks: ""});
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (item) => {
        // Safely reads either flat property or deeply nested structure from database payload
        const selectedClassId = item.classRoomId || item.classRoom?.id || "";
        const selectedSubjectId = item.subjectId || item.subject?.id || "";

        setForm({
            id: item.id,
            title: item.title,
            subjectId: selectedSubjectId,
            classRoomId: selectedClassId,
            examDate: item.examDate ? item.examDate.substring(0, 10) : "",
            totalMarks: item.totalMarks,
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: form.title,
                subjectId: Number(form.subjectId),
                classRoomId: Number(form.classRoomId),
                examDate: form.examDate,
                totalMarks: Number(form.totalMarks),
            };

            if (isEdit) {
                await updateExam(form.id, payload);
            } else {
                await createExam(payload);
            }
            setIsOpen(false);
            fetchExams();
        } catch (err) {
            alert("Failed to save changes onto the database server!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently remove this scheduled exam?")) {
            try {
                await deleteExam(id);
                fetchExams();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#f8fafc]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f1e3c]">Exams Management</h1>
                    <p className="text-xs text-gray-400">
                        Organize and coordinate assessment checks by track modules and subject lines
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                >
                    + Create New Exam
                </button>
            </div>

            <input
                className="border border-gray-200 bg-white rounded-xl p-2.5 w-full mb-6 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Search schedules by title descriptor, subject tracking, or classroom module..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams
                .filter(
                    (e) =>
                        e.title?.toLowerCase().includes(search.toLowerCase()) ||
                        e.classRoomName?.toLowerCase().includes(search.toLowerCase()) ||
                        e.classRoom?.name?.toLowerCase().includes(search.toLowerCase())
                )
                .map((exam) => {
                    const displayClassName = exam.classRoomName || exam.classRoom?.name || "Unassigned";
                    const displaySubjectName = exam.subjectName || exam.subject?.name || "General";

                    return (
                        <div
                            key={exam.id}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                        Class: {displayClassName}
                                    </span>
                                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                                        {displaySubjectName}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 mb-2">{exam.title}</h3>
                                <p className="text-xs text-slate-500">
                                    Date Matrix: <span className="font-mono">{exam.examDate}</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Total Marks: <span className="text-red-600 font-bold">{exam.totalMarks}</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3 mt-4">
                                <button
                                    onClick={() => handleEdit(exam)}
                                    className="bg-slate-50 hover:bg-amber-500 text-slate-700 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDelete(exam.id)}
                                    className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-xl text-xs transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 text-white text-sm font-bold">
                            {isEdit ? "Update Exam Properties" : "Provision New Exam Sheet"}
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Exam Title</label>
                                <input
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs"
                                    value={form.title}
                                    required
                                    onChange={(e) => setForm({...form, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">
                                    Select Academic Course Subject
                                </label>
                                <select
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs"
                                    value={form.subjectId}
                                    required
                                    onChange={(e) => setForm({...form, subjectId: e.target.value})}
                                >
                                    <option value="">-- Choose Subject Module --</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                    Assign Classroom Target
                                </label>
                                <select
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                    value={form.classRoomId}
                                    required
                                    onChange={(e) => setForm({...form, classRoomId: e.target.value})}
                                >
                                    <option value="">-- Choose Classroom Track --</option>
                                    {classRooms.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} {cls.section ? `(${cls.section})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Calendar Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs"
                                        value={form.examDate}
                                        required
                                        onChange={(e) => setForm({...form, examDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">
                                        Max Ceiling Score
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs"
                                        value={form.totalMarks}
                                        required
                                        onChange={(e) => setForm({...form, totalMarks: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-slate-100 py-2 rounded-xl text-xs font-bold"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Exams;
