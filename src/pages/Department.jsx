import { useEffect, useState } from "react";
import {
    createDepartment,
    deleteDepartment,
    getAllDepartment,
    updateDepartment
} from "../Service/DepartmentService";

function Department() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [form, setForm] = useState({
        id: null,
        name: "",
        description: ""
    });

    useEffect(() => {
        fetchDepartment();
    }, []);

    const fetchDepartment = async () => {
        try {
            const res = await getAllDepartment();
            setDepartments(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setForm({ id: null, name: "", description: "" });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (d) => {
        setForm({ id: d.id, name: d.name || "", description: d.description || "" });
        setIsEdit(true);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        try {
            await deleteDepartment(id);
            fetchDepartment();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { name: form.name, description: form.description };
        try {
            if (isEdit) {
                await updateDepartment(form.id, payload);
            } else {
                await createDepartment(payload);
            }
            setIsOpen(false);
            fetchDepartment();
        } catch (error) {
            console.log(error);
        }
    };

    
    const filtered = departments.filter((d) => {
        const q = search.toLowerCase();
        return (
            d.name?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
        );
    });

    
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

    
    const avatarColors = [
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600",
        "bg-emerald-100 text-emerald-600",
        "bg-orange-100 text-orange-600",
        "bg-pink-100 text-pink-600",
        "bg-teal-100 text-teal-600",
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">

                {}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage all departments</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add department
                    </button>
                </div>

                {}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Total departments</p>
                        <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Showing results</p>
                        <p className="text-2xl font-semibold text-blue-600">{filtered.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 mb-1">Current page</p>
                        <p className="text-2xl font-semibold text-purple-500">
                            {totalPages === 0 ? 0 : currentPage} / {totalPages}
                        </p>
                    </div>
                </div>

                {}
                <div className="relative mb-6">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-sm text-gray-400">No departments found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginated.map((d) => {
                                    const colorClass = avatarColors[d.id % avatarColors.length];
                                    const initial = (d.name?.[0] || "D").toUpperCase();
                                    return (
                                        <div
                                            key={d.id}
                                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                                        >
                                            {}
                                            <div>
                                                <div className="flex items-start gap-3 mb-3">
                                                    {}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}>
                                                        {initial}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                {d.name}
                                                            </h3>
                                                            <span className="text-xs font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md shrink-0">
                                                                #{d.id}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">Department</p>
                                                    </div>
                                                </div>

                                                {}
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 min-h-[48px] bg-gray-50 rounded-lg px-3 py-2">
                                                    {d.description || "No description provided for this department."}
                                                </p>
                                            </div>

                                            {}
                                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-4">
                                                <button
                                                    onClick={() => handleEdit(d)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(d.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-xs text-gray-500">
                                    Showing{" "}
                                    <span className="font-medium text-gray-700">{(currentPage - 1) * pageSize + 1}</span>
                                    {" "}–{" "}
                                    <span className="font-medium text-gray-700">{Math.min(currentPage * pageSize, filtered.length)}</span>
                                    {" "}of{" "}
                                    <span className="font-medium text-gray-700">{filtered.length}</span>
                                    {" "}departments
                                </p>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {getPageNumbers().map((page, idx) =>
                                        page === "..." ? (
                                            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">...</span>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-base font-semibold text-white">
                                {isEdit ? "Update department" : "Add new department"}
                            </h2>
                            <p className="text-blue-200 text-xs mt-1">
                                {isEdit ? "Edit the information below and save your changes" : "Fill in the details to create a new department"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Department name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Computer Science"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter a short description of this department..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
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
                                    {isEdit ? "Save changes" : "Create department"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Department;