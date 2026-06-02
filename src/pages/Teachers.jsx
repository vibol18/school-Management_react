import {useEffect, useState} from "react";
import {showAllteacher, createTeacher, updateTeacher, deleteTeahcer} from "../Service/teacherService";
import {getAllDepartment} from "../Service/DepartmentService";

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [form, setForm] = useState({
        id: null,
        teacherCode: "",
        firstName: "",
        lastName: "",
        email: "",
        salary: "",
        departmentId: "",
    });

    useEffect(() => {
        fetchTeachers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await getAllDepartment();
            setDepartments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await showAllteacher();
            setTeachers(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setForm({id: null, teacherCode: "", firstName: "", lastName: "", email: "", salary: "", departmentId: ""});
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (t) => {
        setForm({
            id: t.id,
            teacherCode: t.teacherCode || "",
            firstName: t.firstName || "",
            lastName: t.lastName || "",
            email: t.email || "",
            salary: t.salary || "",
           departmentId: t.departmentId || "",
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this teacher?")) return;
        try {
            await deleteTeahcer(id);
            fetchTeachers();
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            teacherCode: form.teacherCode,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            salary: form.salary,
            departmentId: Number(form.departmentId),
        };

        try {
            if (isEdit) {
                await updateTeacher(form.id, payload);
            } else {
                await createTeacher(payload);
            }

            setIsOpen(false);
            fetchTeachers();
        } catch (err) {
            console.log(err);
        }
    };

    // SEARCH
    const filtered = teachers.filter((t) => {
        const q = search.toLowerCase();
        return (
            t.teacherCode?.toLowerCase().includes(q) ||
            t.firstName?.toLowerCase().includes(q) ||
            t.lastName?.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q) ||
            (t.departmentName || "").toLowerCase().includes(q)
        );
    });

    // PAGINATION
    const totalPages = Math.ceil(filtered.length / pageSize);
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

    const totalMale = teachers.filter((t) => t.gender === "MALE").length;
    const totalFemale = teachers.filter((t) => t.gender === "FEMALE").length;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage teacher information and departments</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add teacher
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Total teachers</p>
                        <p className="text-2xl font-semibold text-gray-900">{teachers.length}</p>
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
                <div className="relative mb-6">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, code, email, or department..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* CARDS */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-10 h-10 text-gray-300 mx-auto mb-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <p className="text-sm text-gray-400">No teachers found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginated.map((t) => (
                                    <div
                                        key={t.id}
                                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                                    >
                                        {/* TOP ROW: ID + CODE */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                                ID: {t.id}
                                            </span>
                                            <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                {t.teacherCode}
                                            </span>
                                        </div>

                                        {/* AVATAR + NAME + EMAIL */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 shrink-0">
                                                {(t.firstName?.[0] || "T").toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {t.firstName} {t.lastName}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {t.email || "No email linked"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* BADGES */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1.5">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-3.5 h-3.5 shrink-0" /* Cleanly sizes the icon to perfectly match text-xs scale */
                                                >
                                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                </svg>
                                                <span>
                                                    {t.salary ? `$${Number(t.salary).toLocaleString()}` : "No salary"}
                                                </span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-3.5 h-3.5 shrink-0" /* Cleanly sizes the icon to match the text scale */
                                                >
                                                    <path d="M22 10L12 4 2 10l10 6 10-6z"></path>
                                                    <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"></path>
                                                </svg>

                                                <span className="truncate">{t.departmentName || "Unassigned"}</span>
                                            </span>
                                        </div>

                                        {/* ACTION BUTTONS */}
                                        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                                                    />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                                                    />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-xs text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium text-gray-700">
                                        {(currentPage - 1) * pageSize + 1}
                                    </span>{" "}
                                    –{" "}
                                    <span className="font-medium text-gray-700">
                                        {Math.min(currentPage * pageSize, filtered.length)}
                                    </span>{" "}
                                    of <span className="font-medium text-gray-700">{filtered.length}</span> teachers
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {getPageNumbers().map((page, idx) =>
                                        page === "..." ? (
                                            <span
                                                key={`dots-${idx}`}
                                                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white border border-blue-600"
                                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-base font-semibold text-white">
                                {isEdit ? "Update teacher" : "Add new teacher"}
                            </h2>
                            <p className="text-blue-200 text-xs mt-1">
                                {isEdit
                                    ? "Edit the information below and save your changes"
                                    : "Fill in the details below to create a teacher record"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                        Teacher code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TCH001"
                                        value={form.teacherCode}
                                        onChange={(e) => setForm({...form, teacherCode: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        placeholder="teacher@school.com"
                                        value={form.email}
                                        onChange={(e) => setForm({...form, email: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
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
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Salary</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1500"
                                        value={form.salary}
                                        onChange={(e) => setForm({...form, salary: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Department</label>

                                    <select
                                        value={form.departmentId}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                departmentId: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Department</option>

                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
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
                                    {isEdit ? "Save changes" : "Create teacher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Teachers;
