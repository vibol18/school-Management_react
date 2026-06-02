import { useEffect, useState } from "react";
import { getCourseById } from "../Service/courseService";

function ViewStudent({ student: s, onBack, onEdit, onDelete }) {
    const [course, setCourse] = useState(s.course || null);
    const [courseLoading, setCourseLoading] = useState(false);
    const [imageError, setImageError] = useState(false); // Clean fallback state

    // Safely track the course ID primitive
    const courseId = s.course?.id;

    useEffect(() => {
        if (!courseId) {
            setCourse(null);
            return;
        }

        let isMounted = true;
        setCourseLoading(true);

        getCourseById(courseId)
            .then(res => {
                if (isMounted) setCourse(res.data);
            })
            .catch(() => {
                if (isMounted) setCourse(s.course);
            })
            .finally(() => {
                if (isMounted) setCourseLoading(false);
            });

        // Cleanup function prevents state updates if user navigates away mid-fetch
        return () => {
            isMounted = false;
        };
    }, [courseId, s.course]);

    const initials = ((s.firstName?.[0] || "") + (s.lastName?.[0] || "")).toUpperCase() || "??";

    // Reusable custom field component
    const Field = ({ label, value }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">{label}</span>
            <span className={`text-sm font-medium ${value ? "text-gray-900" : "text-gray-400 italic"}`}>
                {value || "—"}
            </span>
        </div>
    );

    const levelColor = {
        Advanced: "bg-red-50 text-red-700 border-red-100",
        Intermediate: "bg-amber-50 text-amber-700 border-amber-100",
        Beginner: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">

                {/* BREADCRUMB */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <span className="text-sm text-gray-400">Students</span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-sm text-gray-600 font-medium">{s.firstName} {s.lastName}</span>
                </div>

                {/* HERO CARD */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-teal-400 to-pink-400" />
                    <div className="p-6 flex items-center gap-5">
                        <div className="relative shrink-0">
                            {s.photo ? (
                                <img
                                    src={s.photo}
                                    alt={`${s.firstName} ${s.lastName}`}
                                    className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-100"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600 ring-2 ring-blue-100">
                                    {initials}
                                </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-semibold text-gray-900 truncate">
                                {s.firstName} {s.lastName}
                            </h1>
                            <p className="text-sm text-gray-400 mb-3">Student ID: {s.studentCode}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    s.gender === "MALE" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                                }`}>
                                    {s.gender === "MALE" ? "Male" : "Female"}
                                </span>
                                {s.clazz && (
                                    <span className="inline-block px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                        {s.clazz.name}
                                    </span>
                                )}
                                {course && (
                                    <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                        {course.name}
                                    </span>
                                )}
                                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                    Active
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                            <button
                                onClick={() => onEdit(s)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(s.id)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* PERSONAL + CONTACT */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-medium text-gray-700">Personal info</h2>
                        </div>
                        <div className="space-y-3 divide-y divide-gray-50">
                            <Field label="First name" value={s.firstName} />
                            <div className="pt-3"><Field label="Last name" value={s.lastName} /></div>
                            <div className="pt-3"><Field label="Gender" value={s.gender === "MALE" ? "Male" : "Female"} /></div>
                            <div className="pt-3"><Field label="Date of birth" value={s.dateOfBirth} /></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-medium text-gray-700">Contact</h2>
                        </div>
                        <div className="space-y-3 divide-y divide-gray-50">
                            <Field label="Phone" value={s.phone} />
                            <div className="pt-3"><Field label="Address" value={s.address} /></div>
                            <div className="pt-3">
                                <span className="text-xs text-gray-400 block mb-0.5">Photo</span>
                                {s.photo ? (
                                    <img src={s.photo} alt="Student thumbnail" className="w-12 h-12 rounded-lg object-cover border border-gray-100 mt-1" />
                                ) : (
                                    <span className="text-sm text-gray-400 italic">No photo</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CLASSROOM */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-medium text-gray-700">Classroom</h2>
                    </div>
                    {s.clazz ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-xs text-green-600 font-medium mb-0.5">Assigned class</p>
                            <p className="text-base font-semibold text-green-900">{s.clazz.name}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No classroom assigned</p>
                    )}
                </div>

                {/* COURSE DETAIL */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
                    <div className="flex items-center gap-2 p-5 pb-4 border-b border-gray-50">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-medium text-gray-700">Enrolled course</h2>
                    </div>

                    {courseLoading && (
                        <div className="flex items-center gap-3 p-5">
                            <div className="w-5 h-5 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
                            <span className="text-sm text-gray-400">Loading course details...</span>
                        </div>
                    )}

                    {!courseLoading && !course && (
                        <div className="p-5">
                            <p className="text-sm text-gray-400 italic">No course assigned to this student</p>
                        </div>
                    )}

                    {!courseLoading && course && (
                        <div className="flex gap-0">
                            {course.imageUrl && !imageError && (
                                <div className="w-36 shrink-0 bg-gray-100">
                                    <img
                                        src={course.imageUrl}
                                        alt={course.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            )}
                            <div className="flex-1 p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-base font-semibold text-gray-900">{course.name}</h3>
                                    <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                                        {course.level && (
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${levelColor[course.level] || levelColor["Beginner"]}`}>
                                                {course.level}
                                            </span>
                                        )}
                                        {course.active !== undefined && (
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${course.active ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                                {course.active ? "Active" : "Archived"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {course.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                                        {course.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 flex-wrap">
                                    {course.duration && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium text-gray-700">{course.duration}</span>
                                        </div>
                                    )}
                                    {course.price !== undefined && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-semibold text-gray-900">${Number(course.price).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {course.subjects && course.subjects.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1.5">Subjects</p>
                                        <div className="flex flex-wrap gap-1">
                                            {course.subjects.map((sub, i) => (
                                                <span key={i} className="text-xs bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
							</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ViewStudent;