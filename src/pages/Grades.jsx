import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API Axios endpoints matching your backend service declarations
const getGrades = () => axios.get("http://localhost:8080/api/grades");
const createGrade = (data) => axios.post("http://localhost:8080/api/grades", data);
const updateGrade = (id, data) => axios.put(`http://localhost:8080/api/grades/${id}`, data);
const deleteGrade = (id) => axios.delete(`http://localhost:8080/api/grades/${id}`);

function Grades() {
  const [gradeRecords, setGradeRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  
  // Tracking inputs for active editing structures
  const [editScores, setEditScores] = useState({ 
    score: 0, 
    grade: "", 
    remark: "",
    studentId: null,
    examId: null
  });

  // Load database rows on component mount
  useEffect(() => {
    fetchInitialGrades();
  }, []);

  const fetchInitialGrades = async () => {
    try {
      const response = await getGrades();
      setGradeRecords(response.data);
    } catch (error) {
      console.error("Error fetching live grade records from backend:", error);
    }
  };

  // Status Badge Color Map
  const getStatusStyle = (gradeLetter) => {
    switch(gradeLetter?.toUpperCase()) {
      case "A": case "B": 
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "C": case "D": 
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "E": 
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "F": 
        return "bg-red-50 text-red-700 border-red-100";
      default: 
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  // Helper calculation to turn raw values into letter grades automatically
  const autoCalculateGradeLetter = (scoreValue) => {
    const numericScore = Number(scoreValue);
    if (numericScore >= 90) return "A";
    if (numericScore >= 80) return "B";
    if (numericScore >= 70) return "C";
    if (numericScore >= 60) return "D";
    if (numericScore >= 50) return "E";
    return "F";
  };

  const startEditing = (record) => {
    setIsEditing(record.id);
    setEditScores({ 
      score: record.score, 
      grade: record.grade, 
      remark: record.remark || "",
      studentId: record.studentId, // Kept to satisfy backend updateGrade mapping parameters
      examId: record.examId       // Kept to satisfy backend updateGrade mapping parameters
    });
  };

  const handleSaveRow = async (id) => {
    try {
      const automaticallyDeterminedLetter = autoCalculateGradeLetter(editScores.score);
      
      const payload = {
        studentId: editScores.studentId,
        examId: editScores.examId,
        score: Number(editScores.score),
        grade: automaticallyDeterminedLetter,
        remark: editScores.remark || (Number(editScores.score) >= 50 ? "Passed" : "Failed")
      };

      // Put to Spring Boot server controller endpoint
      await updateGrade(id, payload);
      setIsEditing(null);
      
      // Refresh current records state values view directly from backend db
      await fetchInitialGrades();
    } catch (error) {
      console.error("Failed saving grade update row entry to API database:", error);
      alert("Could not update grade details. Verify entity mappings matching backend constraints.");
    }
  };

  const handleDeleteRow = async (id) => {
    if (window.confirm("Are you sure you want to permanently remove this grade entry record?")) {
      try {
        await deleteGrade(id);
        await fetchInitialGrades();
      } catch (error) {
        console.error("Error executing row delete command:", error);
      }
    }
  };

  // Live filter matching search fields
  const filteredRecords = gradeRecords.filter(r => 
    r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.examTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.studentId).includes(searchTerm)
  );

  // Dynamic Statistics Computations directly out of database lists
  const classAverage = gradeRecords.length > 0 
    ? (gradeRecords.reduce((acc, curr) => acc + curr.score, 0) / gradeRecords.length).toFixed(1) 
    : 0;

  const passingRate = gradeRecords.length > 0
    ? ((gradeRecords.filter(r => r.score >= 50).length / gradeRecords.length) * 100).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0f1e3c] tracking-tight">Grades Ledger</h1>
            <p className="text-xs text-gray-400 mt-0.5">Live database synchronization. Update raw performance metric tiers seamlessly.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search student or exam topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* ── METRIC SNAPSHOT BANNER ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Database Mean Score</p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{classAverage}%</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Passing Rate (Score &gt;= 50)</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{passingRate}%</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Recorded Metrics</p>
            <h3 className="text-xl font-black text-blue-600 mt-1">{gradeRecords.length} Rows</h3>
          </div>
        </div>

        {/* ── MAIN GRADES TABLE DATA GRID ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Record ID</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Examination</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Score Value (Out of 100)</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Grade Tier Badge</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Instructors Remark Note</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 font-medium">
                      No active evaluations match your current lookup criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition duration-150">
                      
                      {/* Unique Row Grade ID */}
                      <td className="p-4 font-mono font-bold text-slate-400">
                        #{record.id}
                      </td>

                      {/* Student Identity Mapping */}
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{record.studentName}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID Ref: {record.studentId}</p>
                      </td>

                      {/* Target Exam Details */}
                      <td className="p-4 text-slate-700 font-medium">
                        {record.examTitle}
                        <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Exam Ref Key: {record.examId}</span>
                      </td>

                      {/* Score Input Fields vs Raw Values */}
                      <td className="p-4">
                        {isEditing === record.id ? (
                          <input
                            type="number"
                            max="100" min="0"
                            value={editScores.score}
                            onChange={(e) => setEditScores({ ...editScores, score: e.target.value })}
                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-800 font-mono text-sm">{record.score} / 100</span>
                        )}
                      </td>

                      {/* Automatically Computed Grade Badge Column */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-md border ${getStatusStyle(isEditing === record.id ? autoCalculateGradeLetter(editScores.score) : record.grade)}`}>
                          Grade {isEditing === record.id ? autoCalculateGradeLetter(editScores.score) : record.grade}
                        </span>
                      </td>

                      {/* Instructor Remarks Field */}
                      <td className="p-4">
                        {isEditing === record.id ? (
                          <input
                            type="text"
                            value={editScores.remark}
                            placeholder="Enter short evaluation note..."
                            onChange={(e) => setEditScores({ ...editScores, remark: e.target.value })}
                            className="w-full min-w-[150px] px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        ) : (
                          <span className="text-slate-500 font-medium italic">{record.remark || "No comments entry"}</span>
                        )}
                      </td>

                      {/* Operational Control Action Blocks */}
                      <td className="p-4 text-right">
                        {isEditing === record.id ? (
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => setIsEditing(null)} 
                              className="px-2 py-1 border border-gray-200 hover:bg-gray-50 text-slate-600 rounded-lg font-bold text-[11px] transition"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveRow(record.id)} 
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-3 items-center">
                            <button 
                              onClick={() => startEditing(record)} 
                              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRow(record.id)} 
                              className="text-red-400 hover:text-red-600 font-medium"
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
          </div>
        </div>

      </div>
    </div>
  );
}

export default Grades;