import React, { useEffect, useState } from 'react';
import { studentAll } from '../Service/studentService';
import { showAllteacher } from '../Service/teacherService';
import { getAllCourses } from '../Service/courseService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

const AGENDA = [
  { time: '08:00 am', grade: 'All Grade', title: 'Homeroom & Announcement', color: '#f5f3ff' },
  { time: '10:00 am', grade: 'Grade 3–5', title: 'Math Review & Practice', color: '#fefce8' },
  { time: '10:30 am', grade: 'Grade 6–8', title: 'Science Experiment & Discussion', color: '#f5f3ff' },
];

const CALENDAR_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CALENDAR_DATES = [19, 20, 21, 22, 23, 24, 25];

function StatCard({ value, label, trend, trendUp, color, loading }) {
  return (
    <div style={{
      background: color,
      borderRadius: 20,
      padding: '20px 24px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          fontSize: 12, fontWeight: 700,
          padding: '4px 10px', borderRadius: 20,
          background: 'rgba(255,255,255,0.6)',
          color: trendUp ? '#16a34a' : '#dc2626',
        }}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span style={{ color: 'rgba(0,0,0,0.25)', fontSize: 16, cursor: 'pointer', letterSpacing: 2 }}>···</span>
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', color: '#1a1a2e', marginBottom: 6 }}>
        {loading ? '...' : value.toLocaleString()}
      </div>
      <div style={{ fontSize: 14, color: '#4a4a6a', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const BarTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 13 }}>
        <strong>{payload[0].value}</strong> students
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 13 }}>
        <strong>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [genderData, setGenderData] = useState([]);
  const [coursePopularity, setCoursePopularity] = useState([]);

  useEffect(() => {
    Promise.all([studentAll(), showAllteacher(), getAllCourses()])
      .then(([studentRes, teacherRes, courseRes]) => {
        const extractArray = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          let payload = res.data !== undefined ? res.data : res;
          if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch (e) { return []; }
          }
          if (Array.isArray(payload)) return payload;
          if (payload && Array.isArray(payload.data)) return payload.data;
          if (payload && Array.isArray(payload.students)) return payload.students;
          return [];
        };

        const students = extractArray(studentRes);
        const teachers = extractArray(teacherRes);
        const courses = extractArray(courseRes);

        const males = students.filter(s => ['male', 'm'].includes(s?.gender?.toLowerCase())).length;
        const females = students.filter(s => ['female', 'f'].includes(s?.gender?.toLowerCase())).length;
        setGenderData([
          { name: 'Boys', value: males, color: '#a5b4fc' },
          { name: 'Girls', value: females, color: '#fcd34d' },
        ]);

        let salarySum = 0;
        teachers.forEach(t => { salarySum += parseFloat(t?.salary) || 0; });
        setTotalSalary(salarySum);

        const courseMap = {};
        students.forEach(s => {
          if (!s) return;
          const cName = s.course_name || s.course?.name || 'Unassigned';
          courseMap[cName] = (courseMap[cName] || 0) + 1;
        });
        setCoursePopularity(
          Object.keys(courseMap)
            .map(k => ({ name: k, students: courseMap[k] }))
            .sort((a, b) => b.students - a.students)
            .slice(0, 5)
        );

        setStudentCount(students.length);
        setTeacherCount(teachers.length);
        setClassesCount(courses.length);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const totalGender = genderData.reduce((a, b) => a + b.value, 0);
  const boysCount = genderData.find(d => d.name === 'Boys')?.value || 0;
  const girlsCount = genderData.find(d => d.name === 'Girls')?.value || 0;

  return (
    <div style={{
      background: '#eef0fb',
      minHeight: '100%',
      padding: '24px',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>

      {/* STAT CARDS */}
      <div style={{ display: 'flex', gap: 16 }}>
        <StatCard value={studentCount} label="Students"   trend="15%" trendUp={true}  color="#c7d2fe" loading={loading} />
        <StatCard value={teacherCount} label="Teachers"   trend="3%"  trendUp={false} color="#fde68a" loading={loading} />
        <StatCard value={classesCount} label="Courses"    trend="3%"  trendUp={false} color="#c7d2fe" loading={loading} />
        <StatCard value={totalSalary}  label="Payroll ($)" trend="5%" trendUp={true}  color="#fde68a" loading={loading} />
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>

        {/* Students Donut */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '20px',
          width: 230, flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b' }}>Students</span>
            <span style={{ color: '#94a3b8', fontSize: 16, cursor: 'pointer', letterSpacing: 2 }}>···</span>
          </div>

          <div style={{ flex: 1, position: 'relative', minHeight: 180 }}>
            {!loading && totalGender > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                {loading ? 'Loading...' : 'No data'}
              </div>
            )}
            {!loading && totalGender > 0 && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 26, pointerEvents: 'none', lineHeight: 1,
              }}>👥</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>{boysCount}</div>
              <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a5b4fc', display: 'inline-block' }} />
                Boys ({totalGender > 0 ? Math.round(boysCount / totalGender * 100) : 0}%)
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>{girlsCount}</div>
              <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fcd34d', display: 'inline-block' }} />
                Girls ({totalGender > 0 ? Math.round(girlsCount / totalGender * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Course Bar Chart */}
        <div style={{
          flex: 1, background: '#fff', borderRadius: 24, padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', minWidth: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b' }}>Course Enrollment</span>
            <span style={{
              fontSize: 12, background: '#eef0fb', borderRadius: 20,
              padding: '5px 14px', color: '#4338ca', cursor: 'pointer', fontWeight: 600,
            }}>Top 5 ▾</span>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#a5b4fc', display: 'inline-block' }} />
              Enrolled
            </span>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fde68a', display: 'inline-block' }} />
              Top Course
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 200 }}>
            {!loading && coursePopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={coursePopularity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(165,180,252,0.12)' }} />
                  <Bar dataKey="students" radius={[8, 8, 0, 0]} barSize={36}>
                    {coursePopularity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#fde68a' : '#a5b4fc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                {loading ? 'Loading course data...' : 'No course data found.'}
              </div>
            )}
          </div>
        </div>

        {/* Calendar + Agenda */}
        <div style={{ width: 290, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mini Calendar */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 16, color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>‹</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1e1b4b' }}>September 2030</span>
              <span style={{ fontSize: 16, color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>›</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0', textAlign: 'center' }}>
              {CALENDAR_DAYS.map(d => (
                <div key={d} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', paddingBottom: 6 }}>{d}</div>
              ))}
              {CALENDAR_DATES.map(date => (
                <div key={date} style={{
                  width: 32, height: 32, margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: 13, fontWeight: date === 22 ? 800 : 500,
                  background: date === 22 ? '#6366f1' : 'transparent',
                  color: date === 22 ? '#fff' : '#1e1b4b',
                  cursor: 'pointer',
                }}>{date}</div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '18px 20px', flex: 1, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b' }}>Agenda</span>
              <span style={{ color: '#94a3b8', fontSize: 16, cursor: 'pointer', letterSpacing: 2 }}>···</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AGENDA.map((item, i) => (
                <div key={i} style={{
                  background: item.color, borderRadius: 14,
                  padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', paddingTop: 2, minWidth: 56 }}>
                    {item.time}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, marginBottom: 3 }}>{item.grade}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;