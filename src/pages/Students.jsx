import { useEffect, useState } from "react";
import {
    studentAll,
    createStudent,
    updateStudent,
    deleteStudent
} from "../Service/studentService";
import { getClasses } from "../Service/classService";
import ViewStudent from "./ViewStudent";
import { getAllCourses } from "../Service/courseService";

// ✅ Helper: safely extract an array from any API response shape
const extractArray = (res) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (Array.isArray(data)) return data;
    // Spring Boot paginated: { content: [...] }
    if (Array.isArray(data?.content)) return data.content;
    // Custom wrapper: { students: [...] } or { items: [...] } etc.
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
    return [];
};

function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const pageSize = 5;

    const [form, setForm] = useState({
        id: null,
        studentCode: "",
        firstName: "",
        lastName: "",
        gender: "MALE",
        phone: "",
        classId: "",
        courseId: "",
    });

    useEffect(() => {
        Promise.all([fetchStudents(), fetchClasses(), fetchCourses()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await studentAll();
            const arr = extractArray(res);
            setStudents(arr);
            return arr; 
        } catch (err) {
            console.error("Error fetching students:", err);
            setStudents([]);
            return [];
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await getClasses();
            const arr = extractArray(res);
            setClasses(arr);
            return arr;
        } catch (err) {
            console.error("Error fetching classes:", err);
            setClasses([]);
            return [];
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await getAllCourses();
            const arr = extractArray(res);
            setCourses(arr);
            return arr;
        } catch (err) {
            console.error("Error fetching courses:", err);
            setCourses([]);
            return [];
        }
    };

    const openCreate = () => {
        setForm({ id: null, studentCode: "", firstName: "", lastName: "", gender: "MALE", phone: "", classId: "", courseId: "" });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (s) => {
        setForm({
            id: s?.id,
            studentCode: s?.studentCode || "",
            firstName: s?.firstName || "",
            lastName: s?.lastName || "",
            gender: s?.gender || "MALE",
            phone: s?.phone || "",
            classId: s?.clazz?.id ?? s?.classId ?? "",
            courseId: s?.course?.id ?? s?.courseId ?? "",
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        try {
            await deleteStudent(id);
            fetchStudents();
            setCurrentPage(1); // ✅ Reset page view on record adjustments
        } catch (err) {
            console.error("Error deleting student:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            studentCode: form.studentCode.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            gender: form.gender,
            phone: form.phone.trim() || null, // ✅ Send null instead of empty string if empty
            classId: form.classId ? Number(form.classId) : null, // ✅ Handle clean type matching for foreign keys
            courseId: form.courseId ? Number(form.courseId) : null,
        };
        try {
            if (isEdit) {
                await updateStudent(form.id, payload);
            } else {
                await createStudent(payload);
            }
            setIsOpen(false);
            fetchStudents();
            setCurrentPage(1); // ✅ Crucial fix to force layout re-render view correctly
        } catch (err) {
            console.error("Error submitting student form:", err);
        }
    };

    const safeStudents = Array.isArray(students) ? students : [];

    const filtered = safeStudents.filter((s) => {
        const q = search.toLowerCase();
        return (
            s?.studentCode?.toLowerCase().includes(q) ||
            s?.firstName?.toLowerCase().includes(q) ||
            s?.lastName?.toLowerCase().includes(q) ||
            s?.phone?.toLowerCase().includes(q) ||
            (s?.clazz?.name || "").toLowerCase().includes(q) ||
            (s?.course?.name || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                pages.push(i);
            } else if (i === left - 1 || i === right + 1) {
                pages.push("...");
            }
        }
        return pages;
    };

    const isMale = (gender) => {
        const g = gender?.toUpperCase();
        return g === "MALE" || g === "M";
    };

    const totalMale = safeStudents.filter((s) => isMale(s?.gender)).length;
    const totalFemale = safeStudents.filter((s) => !isMale(s?.gender)).length;

    if (selectedStudent) {
        return (
            <ViewStudent
                student={selectedStudent}
                onBack={() => setSelectedStudent(null)}
                onEdit={(s) => {
                    setSelectedStudent(null);
                    handleEdit(s);
                }}
                onDelete={(id) => {
                    setSelectedStudent(null);
                    handleDelete(id);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage student information and enrollment</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add student
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Total students</p>
                        <p className="text-2xl font-semibold text-gray-900">{safeStudents.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Male</p>
                        <p className="text-2xl font-semibold text-blue-600">{totalMale}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Female</p>
                        <p className="text-2xl font-semibold text-pink-500">{totalFemale}</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="relative mb-4">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, code, phone, class, or course..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full name</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginated.map((s) => (
                                        <tr key={s?.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 text-sm text-gray-400">{s?.id}</td>
                                            <td className="px-5 py-3 text-sm font-medium text-gray-900">{s?.studentCode}</td>
                                            <td className="px-5 py-3 text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                                                        {(s?.firstName?.[0] || "S").toUpperCase()}
                                                    </div>
                                                    {s?.firstName} {s?.lastName}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isMale(s?.gender) ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                                                }`}>
                                                    {isMale(s?.gender) ? "Male" : "Female"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">{s?.phone || "—"}</td>
                                            <td className="px-5 py-3">
                                                <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                                                    {s?.clazz?.name || s?.classId || "Unassigned"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                                                    {s?.course?.name || s?.courseId || "No Course"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedStudent(s)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(s)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s?.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filtered.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-sm text-gray-400">No students found</p>
                                </div>
                            )}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium text-gray-700">{(currentPage - 1) * pageSize + 1}</span>
                                    {" "}–{" "}
                                    <span className="font-medium text-gray-700">Math.min(currentPage * pageSize, filtered.length)</span>
                                    {" "}of{" "}
                                    <span className="font-medium text-gray-700">{filtered.length}</span>
                                    {" "}students
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        &lt;
                                    </button>
                                    {getPageNumbers().map((p, idx) =>
                                        p === "..." ? (
                                            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                                    currentPage === p
                                                        ? "bg-blue-600 text-white border border-blue-600"
                                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL — Create / Edit */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-base font-semibold text-white">
                                {isEdit ? "Update student" : "Add new student"}
                            </h2>
                            <p className="text-blue-200 text-xs mt-1">
                                {isEdit ? "Edit the information below and save your changes" : "Fill in the details below to create a student record"}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Student code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. STU001"
                                        value={form.studentCode || ""}
                                        onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="012 345 6789"
                                        value={form.phone || ""}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={form.firstName || ""}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        value={form.lastName || ""}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender</label>
                                    <select
                                        value={form.gender || "MALE"}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Class</label>
                                    <select
                                        value={form.classId || ""}
                                        onChange={(e) => setForm({ ...form, classId: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">— select class —</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Course</label>
                                <select
                                    value={form.courseId || ""}
                                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">— select course —</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    {isEdit ? "Save changes" : "Create student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;