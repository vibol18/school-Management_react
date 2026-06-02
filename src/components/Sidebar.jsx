import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// ── Nav item config (Can also be moved to a separate navConfig.js file) ── 
const NAV = [
    {
        section: "Overview",
        allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
        items: [
            {
                label: "Dashboard",
                to: "/dashboard",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                ),
            },
            {
                label: "Students",
                to: "/students",
                badge: 4,
                allowedRoles: ["ADMIN", "TEACHER"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                ),
            },
            {
                label: "Teachers",
                to: "/teachers",
                badge: null,
                allowedRoles: ["ADMIN"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                ),
            },
            {
                label: "Departments",
                to: "/departments",
                badge: null,
                allowedRoles: ["ADMIN"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l7-4 7 4v14" />
                        <path d="M9 9h.01" /><path d="M9 12h.01" /><path d="M9 15h.01" />
                        <path d="M15 9h.01" /><path d="M15 12h.01" /><path d="M15 15h.01" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: "Academics",
        allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
        items: [
            {
                label: "Classes",
                to: "/classes",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                ),
            },
            {
                label: "Attendance",
                to: "/attendance",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                ),
            },
            {
                label: "Grades",
                to: "/grades",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                ),
            },
            {
                label: "Timetable",
                to: "/timetable",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                ),
            },
            {
                label: "Subjects",
                to: "/subjects",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER", "STUDENT"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                ),
            },
            {
                label: "Certificates",
                to: "/certificates",
                badge: null,
                allowedRoles: ["ADMIN", "STUDENT"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M13 14.23V22l-1-1-1 1v-7.77" />
                        <path d="M10.5 13.5l-4.5 4.5v-3.5" />
                        <path d="M13.5 13.5l4.5 4.5v-3.5" />
                        <path d="M4 11a8 8 0 1 1 16 0" />
                    </svg>
                ),
            },
            {
                label: "Course",
                to: "/course",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        <path d="M9 7h6" /><path d="M9 11h6" />
                    </svg>
                ),
            },
            {
                label: "Exams",
                to: "/exams",
                badge: null,
                allowedRoles: ["ADMIN", "TEACHER"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: "Admin",
        allowedRoles: ["ADMIN"],
        items: [
            {
                label: "Finance",
                to: "/finance",
                badge: null,
                allowedRoles: ["ADMIN"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
                    </svg>
                ),
            },
            {
                label: "Messages",
                to: "/messages",
                badge: 3,
                allowedRoles: ["ADMIN"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                ),
            },
            {
                label: "Settings",
                to: "/settings",
                badge: null,
                allowedRoles: ["ADMIN"],
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                ),
            },
        ],
    },
];

function Sidebar() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const userRole = user?.role || "STUDENT";

    const handleLogout = () => {
        localStorage.clear(); // Safely clear all properties at once
        navigate("/login");
    };

    // ⚙️ Process and filter items safely based on authenticated context role
    const filteredNav = NAV.filter(group => group.allowedRoles.includes(userRole))
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(userRole))
        }))
        .filter(group => group.items.length > 0); // Drop the entire group header if its sub-items list is empty

    return (
        <aside
            className={`${
                collapsed ? "w-16" : "w-56"
            } bg-[#0f1e3c] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5`}
        >
            {/* Collapse toggle */}
            <div className="flex items-center justify-end p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition duration-150"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg
                        className={`w-4 h-4 transform transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {/* Nav Links Ecosystem Container */}
            <nav className="flex-1 overflow-y-auto pb-4 scrollbar-none space-y-4">
                {filteredNav.map((group, groupIdx) => (
                    <div key={group.section} className="px-2">
                        {/* Section Header Labels */}
                        {!collapsed ? (
                            <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase px-3 mb-1 select-none">
                                {group.section}
                            </p>
                        ) : (
                            // Subtle line breakout representation for cleaner layout structures on collapse
                            groupIdx > 0 && <div className="mx-2 my-3 h-px bg-white/5" />
                        )}

                        {/* Navigation Sub-items loop */}
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 group select-none
                                        ${isActive 
                                            ? "text-[#e8a838] bg-[#e8a838]/10 font-semibold" 
                                            : "text-white/60 hover:text-white/90 hover:bg-white/5"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {/* Left Anchor Pill Indicator Accent */}
                                            {isActive && (
                                                <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#e8a838] rounded-r-md" />
                                            )}

                                            {/* Vector graphic Icon mapping wrapper */}
                                            <span className={`flex-shrink-0 transition-colors ${isActive ? "text-[#e8a838]" : "text-white/50 group-hover:text-white/80"}`}>
                                                {item.icon}
                                            </span>

                                            {/* Main text content + Dynamic Notifications counters */}
                                            {!collapsed ? (
                                                <>
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                    {item.badge && (
                                                        <span className="text-[10px] font-bold bg-[#e8a838] text-[#0f1e3c] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                /* Standalone hover hint overlays for tight compact screens viewport modes */
                                                <span className="pointer-events-none absolute left-full ml-4 px-2.5 py-1.5 bg-[#1a3260] text-white text-xs font-normal rounded-md shadow-xl border border-white/5 opacity-0 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                                                    {item.label}
                                                    {item.badge && ` (${item.badge})`}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout Footer Section */}
            <div className="p-2 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="relative flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-150 group"
                >
                    <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {!collapsed ? (
                        <span className="truncate">Logout</span>
                    ) : (
                        <span className="pointer-events-none absolute left-full ml-4 px-2.5 py-1.5 bg-red-950 text-red-300 text-xs rounded-md shadow-xl border border-red-500/10 opacity-0 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;