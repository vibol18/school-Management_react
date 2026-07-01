import {useEffect, useState} from "react";
import {studentAll, createStudent, updateStudent, deleteStudent} from "../Service/studentService";
import {getClasses} from "../Service/classService";
import ViewStudent from "./ViewStudent";
import {getAllCourses} from "../Service/courseService";

const extractArray = (res) => {
    if (!res) return [];
    const data = res.data ?? res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
    return [];
};

const avatarColors = [
    {bg: "#dbeafe", text: "#2563eb"},
    {bg: "#e0e7ff", text: "#4f46e5"},
    {bg: "#fce7f3", text: "#db2777"},
    {bg: "#dcfce7", text: "#16a34a"},
    {bg: "#fef3c7", text: "#d97706"},
    {bg: "#ffe4e6", text: "#e11d48"},
];

const getAvatarColor = (name = "") => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
};

const initials = (first = "", last = "") => `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";

// ── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const MailIcon = () => (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
    </svg>
);
const PhoneIcon = () => (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
    </svg>
);
const EditIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </svg>
);
const TrashIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
    </svg>
);
const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const pageSize = 10;

    const [form, setForm] = useState({
        id: null,
        studentCode: "",
        firstName: "",
        lastName: "",
        email: "",
        gender: "MALE",
        phone: "",
        parentName: "",
        parentPhone: "",
        status: "active",
        classId: "",
        courseId: "",
    });

    useEffect(() => {
        Promise.all([fetchStudents(), fetchClasses(), fetchCourses()]).finally(() => setLoading(false));
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
            const arr = extractArray(await getClasses());
            setClasses(arr);
            return arr;
        } catch {
            setClasses([]);
            return [];
        }
    };

    const fetchCourses = async () => {
        try {
            const arr = extractArray(await getAllCourses());
            setCourses(arr);
            return arr;
        } catch {
            setCourses([]);
            return [];
        }
    };

    const openCreate = () => {
        setForm({
            id: null,
            studentCode: "",
            firstName: "",
            lastName: "",
            email: "",
            gender: "MALE",
            phone: "",
            parentName: "",
            parentPhone: "",
            status: "active",
            classId: "",
            courseId: "",
        });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (s) => {
        setForm({
            id: s?.id,
            studentCode: s?.studentCode || "",
            firstName: s?.firstName || "",
            lastName: s?.lastName || "",
            email: s?.email || "",
            gender: s?.gender || "MALE",
            phone: s?.phone || "",
            parentName: s?.parentName || "",
            parentPhone: s?.parentPhone || "",
            status: s?.status || "active",
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
            setCurrentPage(1);
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
            email: form.email.trim() || null,
            gender: form.gender,
            phone: form.phone.trim() || null,
            parentName: form.parentName.trim() || null,
            parentPhone: form.parentPhone.trim() || null,
            status: form.status,
            classId: form.classId ? Number(form.classId) : null,
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
            setCurrentPage(1);
        } catch (err) {
            console.error("Error submitting student form:", err);
        }
    };

    const safeStudents = Array.isArray(students) ? students : [];

    // Collect unique grade labels
    const allGrades = [...new Set(safeStudents.map((s) => s?.clazz?.grade || s?.grade).filter(Boolean))].sort();

    const filtered = safeStudents.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch =
            s?.studentCode?.toLowerCase().includes(q) ||
            s?.firstName?.toLowerCase().includes(q) ||
            s?.lastName?.toLowerCase().includes(q) ||
            s?.email?.toLowerCase().includes(q) ||
            s?.phone?.toLowerCase().includes(q) ||
            (s?.clazz?.name || "").toLowerCase().includes(q) ||
            (s?.course?.name || "").toLowerCase().includes(q);
        const matchGrade = !gradeFilter || (s?.clazz?.grade || s?.grade) === gradeFilter;
        return matchSearch && matchGrade;
    });

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };
    const handleGradeFilter = (e) => {
        setGradeFilter(e.target.value);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
            } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
                pages.push("...");
            }
        }
        return pages;
    };

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
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage student records and information</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <PlusIcon />
                        Add Student
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="flex gap-3 mb-5">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={gradeFilter}
                        onChange={handleGradeFilter}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Grades</option>
                        {allGrades.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Grade / Class
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Parent
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginated.map((s) => {
                                        const color = getAvatarColor(s?.firstName || "");
                                        const studentName = `${s?.firstName || ""} ${s?.lastName || ""}`.trim();
                                        const studentEmail = s?.email || s?.studentEmail || "";
                                        const grade = s?.clazz?.grade || s?.grade || "";
                                        const className = s?.clazz?.name || s?.className || "";
                                        const parentName = s?.parentName || "";
                                        const parentPhone = s?.parentPhone || "";
                                        const status = s?.status || "active";

                                        return (
                                            <tr
                                                key={s?.id}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedStudent(s)}
                                            >
                                                {/* Student */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                            style={{backgroundColor: color.bg, color: color.text}}
                                                        >
                                                            {initials(s?.firstName, s?.lastName)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {studentName}
                                                            </div>
                                                            {studentEmail && (
                                                                <div className="text-xs text-gray-400 mt-0.5">
                                                                    {studentEmail}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Grade / Class */}
                                                <td className="px-5 py-3.5">
                                                    {grade && (
                                                        <div className="text-sm font-semibold text-gray-800">
                                                            {grade}
                                                        </div>
                                                    )}
                                                    {className && (
                                                        <div className="text-xs text-gray-400 mt-0.5">{className}</div>
                                                    )}
                                                    {!grade && !className && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>

                                                {/* Contact */}
                                                <td className="px-5 py-3.5">
                                                    {studentEmail && (
                                                        <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1">
                                                            <MailIcon />
                                                            <span>{studentEmail}</span>
                                                        </div>
                                                    )}
                                                    {s?.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <PhoneIcon />
                                                            <span>{s.phone}</span>
                                                        </div>
                                                    )}
                                                    {!studentEmail && !s?.phone && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>

                                                {/* Parent */}
                                                <td className="px-5 py-3.5">
                                                    {parentName && (
                                                        <div className="text-sm font-medium text-gray-800">
                                                            {parentName}
                                                        </div>
                                                    )}
                                                    {parentPhone && (
                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                            {parentPhone}
                                                        </div>
                                                    )}
                                                    {!parentName && !parentPhone && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            status === "active"
                                                                ? "bg-green-50 text-green-600"
                                                                : "bg-red-50 text-red-500"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5">
                                                    <div
                                                        className="flex items-center gap-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            onClick={() => handleEdit(s)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(s?.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                                    <span className="font-medium text-gray-700">
                                        {(currentPage - 1) * pageSize + 1}
                                    </span>
                                    {" – "}
                                    <span className="font-medium text-gray-700">
                                        {Math.min(currentPage * pageSize, filtered.length)}
                                    </span>
                                    {" of "}
                                    <span className="font-medium text-gray-700">{filtered.length}</span>
                                    {" students"}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                                    >
                                        &lt;
                                    </button>
                                    {getPageNumbers().map((p, idx) =>
                                        p === "..." ? (
                                            <span
                                                key={`dots-${idx}`}
                                                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                                            >
                                                …
                                            </span>
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
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-base font-semibold text-white">
                                {isEdit ? "Update student" : "Add new student"}
                            </h2>
                            <p className="text-blue-200 text-xs mt-1">
                                {isEdit
                                    ? "Edit the information below and save your changes"
                                    : "Fill in the details below to create a student record"}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Student code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. STU001"
                                        value={form.studentCode}
                                        onChange={(e) => setForm({...form, studentCode: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({...form, status: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        value={form.firstName}
                                        onChange={(e) => setForm({...form, firstName: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        value={form.lastName}
                                        onChange={(e) => setForm({...form, lastName: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    placeholder="student@school.edu"
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="012 345 6789"
                                        value={form.phone}
                                        onChange={(e) => setForm({...form, phone: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender</label>
                                    <select
                                        value={form.gender}
                                        onChange={(e) => setForm({...form, gender: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Parent name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Parent full name"
                                        value={form.parentName}
                                        onChange={(e) => setForm({...form, parentName: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Parent phone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Parent phone"
                                        value={form.parentPhone}
                                        onChange={(e) => setForm({...form, parentPhone: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Class</label>
                                    <select
                                        value={form.classId}
                                        onChange={(e) => setForm({...form, classId: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">— select class —</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Course</label>
                                    <select
                                        value={form.courseId}
                                        onChange={(e) => setForm({...form, courseId: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">— select course —</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
