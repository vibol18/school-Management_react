import React, {useState, useEffect} from "react";
import {
    getGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    getStudentAverage,
} from "../Service/GradeService";
import { studentAll as getStudents } from "../Service/studentService";
import { getExams } from "../Service/ExamService";

const GRADE_META = {
    A: {color: "#0c447c", bg: "#e6f1fb", border: "#b5d4f4", label: "Excellent"},
    B: {color: "#085041", bg: "#e1f5ee", border: "#9fe1cb", label: "Good"},
    C: {color: "#633806", bg: "#faeeda", border: "#fac775", label: "Average"},
    D: {color: "#854f0b", bg: "#faeeda", border: "#ef9f27", label: "Below Avg"},
    F: {color: "#791f1f", bg: "#fcebeb", border: "#f7c1c1", label: "Fail"},
};

const calcGrade = (score) => {
    const s = Number(score);
    if (s >= 90) return "A";
    if (s >= 80) return "B";
    if (s >= 70) return "C";
    if (s >= 60) return "D";
    return "F";
};

const ScoreBar = ({score}) => {
    const pct = Math.min(100, Math.max(0, Number(score)));
    const grade = calcGrade(score);
    const meta = GRADE_META[grade] || GRADE_META.F;
    return (
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <div style={{flex: 1, height: 6, background: "#f1efe8", borderRadius: 99, overflow: "hidden"}}>
                <div
                    style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: meta.color,
                        borderRadius: 99,
                        transition: "width 0.4s ease",
                    }}
                />
            </div>
            <span style={{fontFamily: "monospace", fontWeight: 500, fontSize: 13, color: "#444441", minWidth: 34}}>
                {pct}
            </span>
        </div>
    );
};

const GradeBadge = ({grade}) => {
    const meta = GRADE_META[grade] || {color: "#5f5e5a", bg: "#f1efe8", border: "#d3d1c7", label: grade};
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                background: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
                letterSpacing: "0.01em",
            }}
        >
            <span style={{fontWeight: 700}}>{grade}</span>
            <span style={{opacity: 0.7, fontSize: 11}}>· {meta.label}</span>
        </span>
    );
};

const StatCard = ({icon, label, value, accent}) => (
    <div
        style={{
            background: "#fff",
            border: "0.5px solid #d3d1c7",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
        }}
    >
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: accent + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: accent,
            }}
        >
            {icon}
        </div>
        <div>
            <p
                style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#888780",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}
            >
                {label}
            </p>
            <p style={{margin: "2px 0 0", fontSize: 22, fontWeight: 700, color: "#2c2c2a", lineHeight: 1}}>{value}</p>
        </div>
    </div>
);

const emptyForm = {studentId: "", examId: "", score: "", remark: ""};

export default function Grades() {
    const [records, setRecords] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [filterGrade, setFilterGrade] = useState("All");
    const [avgModal, setAvgModal] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [gradesRes, studentsRes, examsRes] = await Promise.all([
                getGrades(),
                getStudents().catch((err) => {
                    console.error("Students route missing/failed:", err);
                    return {data: []};
                }),
                getExams().catch((err) => {
                    console.error("Exams route missing/failed:", err);
                    return {data: []};
                }),
            ]);
            setRecords(gradesRes.data);
            setStudents(studentsRes.data);
            setExams(examsRes.data);
        } catch (e) {
            console.error("General Fetch Failure:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    
    useEffect(() => {
        if (students.length > 0) console.log("First Student Object Structure:", students[0]);
        if (exams.length > 0) console.log("First Exam Object Structure:", exams[0]);
    }, [students, exams]);

    const startEdit = (rec) => {
        setEditId(rec.id);
        setEditForm({score: rec.score, remark: rec.remark || "", studentId: rec.studentId, examId: rec.examId});
    };

    const saveEdit = async (id) => {
        setSaving(true);
        try {
            const grade = calcGrade(editForm.score);
            await updateGrade(id, {
                studentId: Number(editForm.studentId),
                examId: Number(editForm.examId),
                score: Number(editForm.score),
                grade,
                remark: editForm.remark || (Number(editForm.score) >= 60 ? "Passed" : "Failed"),
            });
            setEditId(null);
            await fetchData();
        } catch (e) {
            alert("Update failed. Check backend schemas or constraints.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this grade record?")) return;
        try {
            await deleteGrade(id);
            await fetchData();
        } catch (e) {
            alert("Delete failed.");
        }
    };

    const handleCreate = async () => {
        if (!createForm.studentId || !createForm.examId || createForm.score === "") {
            alert("Please select a valid Student, Exam context, and key in a score value.");
            return;
        }
        setSaving(true);
        try {
            await createGrade({
                studentId: Number(createForm.studentId),
                examId: Number(createForm.examId),
                score: Number(createForm.score),
                grade: calcGrade(createForm.score),
                remark: createForm.remark,
            });
            setShowCreate(false);
            setCreateForm(emptyForm);
            await fetchData();
        } catch (e) {
            alert("Creation payload validation error. Check application logs.");
        } finally {
            setSaving(false);
        }
    };

    const fetchAvg = async (studentId, studentName) => {
        try {
            const res = await getStudentAverage(studentId);
            setAvgModal({name: studentName, avg: res.data});
        } catch {
            alert("Could not fetch average context scores.");
        }
    };

    const filtered = records.filter((r) => {
        const matchSearch =
            r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            r.examTitle?.toLowerCase().includes(search.toLowerCase()) ||
            String(r.studentId).includes(search);
        const matchGrade = filterGrade === "All" || r.grade === filterGrade;
        return matchSearch && matchGrade;
    });

    const avg = records.length ? (records.reduce((a, c) => a + c.score, 0) / records.length).toFixed(1) : "—";
    const passRate = records.length
        ? Math.round((records.filter((r) => r.score >= 60).length / records.length) * 100)
        : 0;
    const topScore = records.length ? Math.max(...records.map((r) => r.score)) : "—";

    return (
        <div style={{minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Georgia', serif", padding: "28px 32px"}}>
            <div style={{maxWidth: 1100, margin: "0 auto"}}>
                {}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 28,
                    }}
                >
                    <div>
                        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 4}}>
                            <div style={{width: 6, height: 32, background: "#185fa5", borderRadius: 99}} />
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: "#2c2c2a",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Grades Ledger
                            </h1>
                        </div>
                        <p
                            style={{
                                margin: "0 0 0 16px",
                                fontSize: 13,
                                color: "#888780",
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            Academic performance records · {records.length} entries
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "9px 18px",
                            background: "#185fa5",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontWeight: 600,
                            fontSize: 13,
                            fontFamily: "system-ui, sans-serif",
                            cursor: "pointer",
                            letterSpacing: "0.01em",
                        }}
                    >
                        + Add Grade
                    </button>
                </div>

                {}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                        marginBottom: 24,
                    }}
                >
                    <StatCard icon="◎" label="Class Average" value={`${avg}%`} accent="#185fa5" />
                    <StatCard icon="✓" label="Pass Rate (≥60)" value={`${passRate}%`} accent="#0f6e56" />
                    <StatCard icon="★" label="Top Score" value={`${topScore}`} accent="#ba7517" />
                    <StatCard icon="≡" label="Total Records" value={records.length} accent="#533ab7" />
                </div>

                {}
                <div style={{display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap"}}>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student or exam…"
                        style={{
                            flex: 1,
                            minWidth: 220,
                            padding: "9px 14px",
                            border: "0.5px solid #b4b2a9",
                            borderRadius: 9,
                            fontSize: 13,
                            fontFamily: "system-ui, sans-serif",
                            background: "#fff",
                            color: "#2c2c2a",
                            outline: "none",
                        }}
                    />
                    <div style={{display: "flex", gap: 6}}>
                        {["All", "A", "B", "C", "D", "F"].map((g) => (
                            <button
                                key={g}
                                onClick={() => setFilterGrade(g)}
                                style={{
                                    padding: "7px 14px",
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    fontFamily: "system-ui, sans-serif",
                                    cursor: "pointer",
                                    border: filterGrade === g ? "1.5px solid #185fa5" : "0.5px solid #b4b2a9",
                                    background: filterGrade === g ? "#e6f1fb" : "#fff",
                                    color: filterGrade === g ? "#185fa5" : "#5f5e5a",
                                    transition: "all 0.15s",
                                }}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                {}
                <div style={{background: "#fff", border: "0.5px solid #d3d1c7", borderRadius: 14, overflow: "hidden"}}>
                    {loading ? (
                        <div
                            style={{
                                padding: 60,
                                textAlign: "center",
                                color: "#888780",
                                fontFamily: "system-ui, sans-serif",
                                fontSize: 14,
                            }}
                        >
                            Loading records…
                        </div>
                    ) : (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontFamily: "system-ui, sans-serif",
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr style={{borderBottom: "0.5px solid #d3d1c7"}}>
                                    {["ID", "Student", "Exam", "Score", "Grade", "Remark", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "11px 16px",
                                                textAlign: h === "Actions" ? "right" : "left",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: "#888780",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                background: "#f8f7f4",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{padding: 48, textAlign: "center", color: "#b4b2a9"}}>
                                            No records match your search query filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((rec, i) => (
                                        <tr
                                            key={rec.id}
                                            style={{
                                                borderBottom: "0.5px solid #f1efe8",
                                                background: i % 2 === 0 ? "#fff" : "#fdfcfa",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding: "12px 16px",
                                                    color: "#b4b2a9",
                                                    fontFamily: "monospace",
                                                    fontSize: 12,
                                                }}
                                            >
                                                #{rec.id}
                                            </td>
                                            <td style={{padding: "12px 16px"}}>
                                                {editId === rec.id ? (
                                                    <select
                                                        value={editForm.studentId}
                                                        onChange={(e) =>
                                                            setEditForm({...editForm, studentId: e.target.value})
                                                        }
                                                        style={inputStyle}
                                                    >
                                                        {students.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.studentName || s.name || s.fullName || `ID: ${s.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <>
                                                        <p style={{margin: 0, fontWeight: 600, color: "#2c2c2a"}}>
                                                            {rec.studentName}
                                                        </p>
                                                        <button
                                                            onClick={() => fetchAvg(rec.studentId, rec.studentName)}
                                                            style={{
                                                                marginTop: 2,
                                                                fontSize: 11,
                                                                color: "#185fa5",
                                                                background: "none",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                padding: 0,
                                                                fontFamily: "system-ui, sans-serif",
                                                            }}
                                                        >
                                                            view avg ↗
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{padding: "12px 16px", color: "#444441"}}>
                                                {editId === rec.id ? (
                                                    <select
                                                        value={editForm.examId}
                                                        onChange={(e) =>
                                                            setEditForm({...editForm, examId: e.target.value})
                                                        }
                                                        style={inputStyle}
                                                    >
                                                        {exams.map((ex) => (
                                                            <option key={ex.id} value={ex.id}>
                                                                {ex.examTitle ||
                                                                    ex.title ||
                                                                    ex.subject ||
                                                                    `Exam #${ex.id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <>
                                                        <span style={{fontWeight: 500}}>{rec.examTitle}</span>
                                                        <span
                                                            style={{
                                                                display: "block",
                                                                fontSize: 11,
                                                                color: "#b4b2a9",
                                                                fontFamily: "monospace",
                                                            }}
                                                        >
                                                            exam #{rec.examId}
                                                        </span>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{padding: "12px 16px", minWidth: 140}}>
                                                {editId === rec.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editForm.score}
                                                        onChange={(e) =>
                                                            setEditForm({...editForm, score: e.target.value})
                                                        }
                                                        style={{
                                                            width: 72,
                                                            padding: "5px 8px",
                                                            border: "1px solid #b5d4f4",
                                                            borderRadius: 7,
                                                            fontSize: 13,
                                                            background: "#f8fafc",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                ) : (
                                                    <ScoreBar score={rec.score} />
                                                )}
                                            </td>
                                            <td style={{padding: "12px 16px"}}>
                                                <GradeBadge
                                                    grade={editId === rec.id ? calcGrade(editForm.score) : rec.grade}
                                                />
                                            </td>
                                            <td style={{padding: "12px 16px", maxWidth: 180}}>
                                                {editId === rec.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.remark}
                                                        placeholder="Add remark…"
                                                        onChange={(e) =>
                                                            setEditForm({...editForm, remark: e.target.value})
                                                        }
                                                        style={{
                                                            width: "100%",
                                                            padding: "5px 8px",
                                                            border: "1px solid #b5d4f4",
                                                            borderRadius: 7,
                                                            fontSize: 12,
                                                            background: "#f8fafc",
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: rec.remark ? "#5f5e5a" : "#b4b2a9",
                                                            fontStyle: rec.remark ? "normal" : "italic",
                                                        }}
                                                    >
                                                        {rec.remark || "No remark"}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{padding: "12px 16px", textAlign: "right"}}>
                                                {editId === rec.id ? (
                                                    <div style={{display: "flex", gap: 6, justifyContent: "flex-end"}}>
                                                        <button onClick={() => setEditId(null)} style={btnOutline}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveEdit(rec.id)}
                                                            disabled={saving}
                                                            style={btnPrimary}
                                                        >
                                                            {saving ? "…" : "Save"}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{display: "flex", gap: 12, justifyContent: "flex-end"}}>
                                                        <button
                                                            onClick={() => startEdit(rec)}
                                                            style={{...btnLink, color: "#185fa5"}}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rec.id)}
                                                            style={{...btnLink, color: "#a32d2d"}}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {}
                {records.length > 0 && (
                    <div
                        style={{
                            marginTop: 20,
                            background: "#fff",
                            border: "0.5px solid #d3d1c7",
                            borderRadius: 14,
                            padding: "16px 20px",
                        }}
                    >
                        <p
                            style={{
                                margin: "0 0 12px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#888780",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            Grade distribution
                        </p>
                        <div style={{display: "flex", gap: 8}}>
                            {["A", "B", "C", "D", "F"].map((g) => {
                                const count = records.filter((r) => r.grade === g).length;
                                const pct = records.length ? Math.round((count / records.length) * 100) : 0;
                                const meta = GRADE_META[g];
                                return (
                                    <div key={g} style={{flex: 1, textAlign: "center"}}>
                                        <div
                                            style={{
                                                height: 48,
                                                background: "#f1efe8",
                                                borderRadius: 6,
                                                overflow: "hidden",
                                                display: "flex",
                                                alignItems: "flex-end",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: `${pct}%`,
                                                    background: meta.color,
                                                    borderRadius: "4px 4px 0 0",
                                                    minHeight: count > 0 ? 4 : 0,
                                                    transition: "height 0.5s ease",
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                display: "block",
                                                marginTop: 4,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: meta.color,
                                                fontFamily: "system-ui, sans-serif",
                                            }}
                                        >
                                            {g}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#888780",
                                                fontFamily: "system-ui, sans-serif",
                                            }}
                                        >
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {}
            {showCreate && (
                <div style={overlay} onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
                    <div style={modal}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20,
                            }}
                        >
                            <h2 style={{margin: 0, fontSize: 17, fontWeight: 700, color: "#2c2c2a"}}>
                                Add grade record
                            </h2>
                            <button
                                onClick={() => setShowCreate(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 18,
                                    cursor: "pointer",
                                    color: "#888780",
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            {}
                            <div>
                                <label style={labelStyle}>Student Selection</label>
                                <select
                                    value={createForm.studentId}
                                    onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="">-- Choose Student --</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.studentName || s.name || s.fullName || `ID: ${s.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {}
                            <div>
                                <label style={labelStyle}>Exam Target</label>
                                <select
                                    value={createForm.examId}
                                    onChange={(e) => setCreateForm({...createForm, examId: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="">-- Choose Exam --</option>
                                    {exams.map((ex) => (
                                        <option key={ex.id} value={ex.id}>
                                            {ex.examTitle || ex.title || ex.subject || `Exam #${ex.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Score (0–100)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 85"
                                    value={createForm.score}
                                    onChange={(e) => setCreateForm({...createForm, score: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Remark</label>
                                <input
                                    type="text"
                                    placeholder="Optional note"
                                    value={createForm.remark}
                                    onChange={(e) => setCreateForm({...createForm, remark: e.target.value})}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {createForm.score !== "" && (
                            <div
                                style={{
                                    marginTop: 14,
                                    padding: "10px 14px",
                                    background: "#f8f7f4",
                                    borderRadius: 9,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <span style={{fontSize: 12, color: "#888780", fontFamily: "system-ui, sans-serif"}}>
                                    Computed grade:
                                </span>
                                <GradeBadge grade={calcGrade(createForm.score)} />
                            </div>
                        )}
                        <div style={{display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end"}}>
                            <button onClick={() => setShowCreate(false)} style={btnOutline}>
                                Cancel
                            </button>
                            <button onClick={handleCreate} disabled={saving} style={btnPrimary}>
                                {saving ? "Saving…" : "Create record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {avgModal && (
                <div style={overlay} onClick={() => setAvgModal(null)}>
                    <div style={{...modal, maxWidth: 320, textAlign: "center"}}>
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                background: "#e6f1fb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 14px",
                                fontSize: 22,
                            }}
                        >
                            ◎
                        </div>
                        <p
                            style={{
                                margin: "0 0 4px",
                                fontSize: 13,
                                color: "#888780",
                                fontFamily: "system-ui, sans-serif",
                            }}
                        >
                            Student average
                        </p>
                        <p style={{margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#2c2c2a"}}>
                            {avgModal.name}
                        </p>
                        <p style={{margin: "0 0 20px", fontSize: 36, fontWeight: 800, color: "#185fa5"}}>
                            {typeof avgModal.avg === "number" ? avgModal.avg.toFixed(1) : avgModal.avg}
                            <span style={{fontSize: 16, fontWeight: 400, color: "#888780"}}>%</span>
                        </p>
                        <GradeBadge grade={calcGrade(avgModal.avg)} />
                        <button onClick={() => setAvgModal(null)} style={{...btnOutline, marginTop: 16, width: "100%"}}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


const btnPrimary = {
    padding: "8px 16px",
    background: "#185fa5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    letterSpacing: "0.01em",
};
const btnOutline = {
    padding: "8px 14px",
    background: "#fff",
    color: "#5f5e5a",
    border: "0.5px solid #b4b2a9",
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
};
const btnLink = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
    padding: 0,
};
const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
};
const modal = {
    background: "#fff",
    borderRadius: 16,
    padding: "24px 28px",
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
};
const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#888780",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 5,
};
const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "0.5px solid #b4b2a9",
    borderRadius: 8,
    fontSize: 13,
    color: "#2c2c2a",
    background: "#fafaf8",
    boxSizing: "border-box",
    outline: "none",
};
