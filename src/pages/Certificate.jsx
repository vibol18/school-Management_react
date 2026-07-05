import { useEffect, useState } from "react";


import CertificateTemplate from "./CertificateTemplate"; 

import {
    getAllCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate
} from './../Service/CertificateService';

import { studentAll } from "../Service/studentService";
import { getAllCourses } from "../Service/courseService";

function Certificate() {

    const [certificates, setCertificates] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        id: null,
        certificateNo: "",
        studentId: "",
        courseId: "",
        issueDate: "",
        grade: "", 
        remark: ""
    });

    useEffect(() => {
        fetchCertificates();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await getAllCertificates();
            setCertificates(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await studentAll();
            setStudents(res.data);
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

    const openCreate = () => {
        setForm({
            id: null,
            certificateNo: "",
            studentId: "",
            courseId: "",
            issueDate: "",
            grade: "",
            remark: ""
        });
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (c) => {
        setForm({
            id: c.id,
            certificateNo: c.certificateNo || "",
            studentId: c.studentId || "",         
            courseId: c.courseId || "",           
            issueDate: c.issueDate || "",
            grade: c.grade || "", 
            remark: c.remark || ""
        });
        setIsEdit(true);
        setIsOpen(true);
    };

    
    const handleViewDetail = (c) => {
        setSelectedCertificate(c);
        setIsDetailOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this certificate?")) return;
        try {
            await deleteCertificate(id);
            fetchCertificates();
        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            studentId: form.studentId === "" ? null : Number(form.studentId),
            courseId: form.courseId === "" ? null : Number(form.courseId),
            issueDate: form.issueDate === "" ? null : form.issueDate,
            grade: form.grade.trim() === "" ? null : form.grade, 
            remark: form.remark || null
        };

        if (!payload.studentId || !payload.courseId || !payload.issueDate) {
            alert("Please select a Student, a Course, and a valid Issue Date.");
            return;
        }

        try {
            if (isEdit) {
                await updateCertificate(form.id, payload);
            } else {
                await createCertificate(payload);
            }
            setIsOpen(false);
            fetchCertificates();
        } catch (error) {
            console.error("API Error Response:", error.response?.data || error.message);
            alert("Server Error: Check your terminal logs or validation rules.");
        }
    };

    const filtered = certificates.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.certificateNo?.toLowerCase().includes(q) || 
            c.studentName?.toLowerCase().includes(q) ||
            c.courseName?.toLowerCase().includes(q) ||
            c.grade?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">

                {}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage student certificates</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Add Certificate
                    </button>
                </div>

                {}
                <div className="mb-5">
                    <input
                        type="text"
                        placeholder="Search certificate..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Loading...</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Issue Date</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{c.certificateNo}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{c.studentName || "—"}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{c.courseName || "—"}</td>
                                        <td className="px-5 py-4">
                                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                                {c.grade || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{c.issueDate}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(c)}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(c)}
                                                    className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium"
                                                >
                                                    Delete
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

            {}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-lg font-semibold text-white">
                                {isEdit ? "Update Certificate" : "Create Certificate"}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Certificate Code</label>
                                <input
                                    type="text"
                                    value={form.certificateNo}
                                    onChange={(e) => setForm({ ...form, certificateNo: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Student</label>
                                <select
                                    value={form.studentId}
                                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.firstName} {s.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Course</label>
                                <select
                                    value={form.courseId}
                                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Issue Date</label>
                                <input
                                    type="date"
                                    value={form.issueDate}
                                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
                                <input
                                    type="text"
                                    value={form.grade}
                                    onChange={(e) => setForm({ ...form, grade: e.target.value })} 
                                    placeholder="A+"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Remark</label>
                                <textarea
                                    rows="3"
                                    value={form.remark}
                                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                                >
                                    {isEdit ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isDetailOpen && selectedCertificate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-[1180px] overflow-hidden shadow-2xl my-auto">
                        
                        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                            <div>
                                <h2 className="text-md font-semibold text-white">Certificate Live Preview</h2>
                                <p className="text-xs text-slate-400">Preview and download studio-quality certificate image</p>
                            </div>
                            <button 
                                onClick={() => setIsDetailOpen(false)}
                                className="text-gray-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 flex flex-col items-center justify-center bg-gray-100 overflow-x-auto">
                            <CertificateTemplate data={selectedCertificate} />
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-3 flex justify-end border-t">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                            >
                                Close Preview
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Certificate;