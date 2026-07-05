import React, { useState, useEffect } from 'react';

function Setting() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);

  
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone: '+855 12 345 678', 
    language: 'English'
  });

  const [systemForm, setSystemForm] = useState({
    schoolName: 'EduManage International Academy',
    academicYear: '2026-2027',
    currentSemester: 'Semester 1',
    maintenanceMode: false
  });

  
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setProfileForm(prevState => ({
          ...prevState,
          username: parsedUser.name || 'Admin User', 
          email: parsedUser.email || 'admin@school.edu' 
        }));
      }
    } catch (error) {
      console.error("Failed to read user data context profile session token:", error);
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSystemChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSystemForm({ ...systemForm, [e.target.name]: value });
    setIsSaved(false);
  };

  
  const handleSave = (e) => {
    e.preventDefault();
    
    try {
      
      const currentRawUser = localStorage.getItem('user');
      let baseUserObj = currentRawUser ? JSON.parse(currentRawUser) : {};
      
      
      baseUserObj.name = profileForm.username;
      baseUserObj.email = profileForm.email;
      
      localStorage.setItem('user', JSON.stringify(baseUserObj));
      
      
      window.dispatchEvent(new Event('userLogin'));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to write state updates back to configuration thread:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-60px)] text-[#0f1e3c]">
      
      {}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-gray-400">Manage your administrative configurations and account parameters</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        
        {}
        <aside className="w-full md:w-64 bg-[#0f1e3c]/5 border-r border-gray-100 p-4 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
              activeTab === 'profile'
                ? 'bg-[#0f1e3c] text-white shadow-md shadow-[#0f1e3c]/10'
                : 'text-[#0f1e3c]/70 hover:bg-[#0f1e3c]/10 hover:text-[#0f1e3c]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Account Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition text-left ${
              activeTab === 'system'
                ? 'bg-[#0f1e3c] text-white shadow-md shadow-[#0f1e3c]/10'
                : 'text-[#0f1e3c]/70 hover:bg-[#0f1e3c]/10 hover:text-[#0f1e3c]'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            School Parameters
          </button>
        </aside>

        {}
        <main className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSave} className="max-w-xl flex flex-col h-full justify-between gap-8">
            
            {}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-bold mb-1">Account Information</h2>
                <p className="text-xs text-gray-400 mb-6">Real-time user authentication data bound to browser storage settings</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Phone Contact</label>
                    <input
                      type="text"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Language</label>
                    <select
                      name="language"
                      value={profileForm.language}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition"
                    >
                      <option>English</option>
                      <option>Khmer (ភាសាខ្មែរ)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'system' && (
              <div>
                <h2 className="text-lg font-bold mb-1">School Configuration</h2>
                <p className="text-xs text-gray-400 mb-6">Set up systemic academic calendars and branding parameters</p>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Institution Branding Name</label>
                    <input
                      type="text"
                      name="schoolName"
                      value={systemForm.schoolName}
                      onChange={handleSystemChange}
                      className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Active Academic Year</label>
                      <input
                        type="text"
                        name="academicYear"
                        value={systemForm.academicYear}
                        onChange={handleSystemChange}
                        className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Active Term Track</label>
                      <select
                        name="currentSemester"
                        value={systemForm.currentSemester}
                        onChange={handleSystemChange}
                        className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#0f1e3c] focus:bg-white transition"
                      >
                        <option>Semester 1</option>
                        <option>Semester 2</option>
                        <option>Summer Intensive</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-2" />

                  <div className="flex items-start gap-3 bg-red-50/50 border border-red-100 rounded-xl p-4">
                    <input
                      id="maintenanceMode"
                      type="checkbox"
                      name="maintenanceMode"
                      checked={systemForm.maintenanceMode}
                      onChange={handleSystemChange}
                      className="accent-[#0f1e3c] w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="maintenanceMode" className="block text-xs font-semibold text-red-950 cursor-pointer select-none">
                        System Maintenance Lockout Mode
                      </label>
                      <p className="text-[11px] text-red-700/70 mt-0.5 leading-relaxed">
                        Enabling this locks out public portal access for student accounts and teacher registers while database changes are active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
              <div>
                {isSaved && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Configurations written successfully!
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0f1e3c] hover:bg-[#1a3260] active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition shadow-md shadow-[#0f1e3c]/10"
              >
                Save Settings
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}

export default Setting;