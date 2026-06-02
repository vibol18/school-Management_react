import React, { useState, useEffect } from 'react';
import { register } from '../Service/AuthService';
import { getClasses } from '../Service/classService';
import { getAllCourses } from '../Service/courseService';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    classId: '',
    courseId: '',
    role: 'STUDENT' // Defaults to STUDENT
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =========================
  // LIVE API DATA FETCH
  // =========================
  useEffect(() => {
    const fetchLiveDropdownData = async () => {
      try {
        setLoading(true);
        const [classRes, courseRes] = await Promise.all([
          getClasses(),
          getAllCourses()
        ]);

        const activeClasses = Array.isArray(classRes.data) ? classRes.data : (classRes.data?.content || []);
        const activeCourses = Array.isArray(courseRes.data) ? courseRes.data : (courseRes.data?.content || []);

        setClasses(activeClasses);
        setCourses(activeCourses);
      } catch (err) {
        console.error("Failed to sync structural form dropdown values:", err);
        setError("System warning: Unable to populate configuration maps safely.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveDropdownData();
  }, []);

  // =========================
  // CHANGE HANDLER
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear dependencies if role switches away from student
    if (name === 'role' && value !== 'STUDENT') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        classId: '',
        courseId: ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // =========================
  // SUBMIT HANDLER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Build tailored payload based on the entity processing rules of your backend
      const payload = {
        ...formData,
        classId: formData.role === 'STUDENT' && formData.classId ? Number(formData.classId) : null,
        courseId: formData.role === 'STUDENT' && formData.courseId ? Number(formData.courseId) : null
      };

      const response = await register(payload);
      setMessage(response.data || 'Account provisioned successfully!');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        classId: '',
        courseId: '',
        role: 'STUDENT'
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration Pipeline Failed'
      );
    }
  };

  // Modern UI Styles
  const formGroupStyle = { marginBottom: '16px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333', fontSize: '14px' };
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#fff'
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '60px auto',
        padding: '30px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <h2 style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#1a202c' }}>
        Create an Account
      </h2>

      {message && (
        <div style={{ color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* ROLE SELECT - Moved up to change the visible fields early */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Account Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* USERNAME */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="johndoe"
          />
        </div>

        {/* EMAIL */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="you@example.com"
          />
        </div>

        {/* PASSWORD */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        {/* FIRST NAME & LAST NAME ROW */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* PHONE */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
            placeholder="123-456-7890"
          />
        </div>

        {/* DYNAMIC RELATIONAL INPUT BLOCKS FOR STUDENTS ONLY */}
        {formData.role === 'STUDENT' && (
          <>
            {/* CLASS SELECT */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Assigned Class</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                style={inputStyle}
                required
                disabled={loading}
              >
                <option value="">{loading ? "Syncing classes..." : "-- Select a Class --"}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE SELECT */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Course Track Blueprint</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                style={inputStyle}
                required
                disabled={loading}
              >
                <option value="">{loading ? "Syncing courses..." : "-- Select a Course --"}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#cbd5e1' : '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            marginTop: '10px'
          }}
          onMouseOver={(e) => { if (!loading) e.target.style.backgroundColor = '#0056b3'; }}
          onMouseOut={(e) => { if (!loading) e.target.style.backgroundColor = '#007BFF'; }}
        >
          {loading ? "Syncing APIs..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
}

export default Register;