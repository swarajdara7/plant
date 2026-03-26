// UserDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaLeaf, FaBell, FaCog } from "react-icons/fa";

const UserDashboard = ({ activeTab = "dashboard" }) => {
  const [activePage, setActivePage] = useState(activeTab);

  useEffect(() => {
    setActivePage(activeTab);
  }, [activeTab]);
  
  const [data, setData] = useState({
    userId: "",
    username: "User",
    totalPlants: 0,
    totalReminders: 0,
    plants: [],
    reminders: [],
  });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [brochure, setBrochure] = useState([]);
  const [requestFile, setRequestFile] = useState(null);
  const [requestPreview, setRequestPreview] = useState(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [brochureMsg, setBrochureMsg] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const markReminderDone = async (reminderId) => {
    try {
      // Find the existing reminder locally to flip the status
      const reminderToUpdate = data.reminders.find(r => r.id === reminderId);
      if (!reminderToUpdate) return;
      
      // Hit the user/reminders API to update the status and generate the next reminder
      await axios.put(`http://localhost:9090/api/user/reminders/${reminderId}/completed`);
      
      // Update local state without waiting for re-fetch to seem instantaneous
      setData(prev => ({
        ...prev,
        reminders: prev.reminders.map(r => r.id === reminderId ? { ...r, completed: true } : r)
      }));
    } catch (err) {
      console.error("Error updating reminder status", err);
    }
  };

  // Fetch user-specific data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId"); 
        if (!userId) {
          console.error("No userId found in localStorage");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:9090/api/user/${userId}/stats`
        );

        setData({
          userId: res.data.userId,
          username: res.data.username || "User",
          totalPlants: res.data.totalPlants,
          totalReminders: res.data.totalReminders,
          plants: res.data.plants,
          reminders: res.data.reminders,
        });

        setLoading(false);

        // Fetch brochure separately
        try {
          const bRes = await axios.get("http://localhost:9090/api/user/plants/brochure");
          setBrochure(bRes.data);
        } catch (e) { console.error(e); }

      } catch (err) {
        console.error("Error fetching user data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRequestFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRequestPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestPreview) return;
    setRequestMsg("Sending request to Admin...");
    try {
      await axios.post(`http://localhost:9090/api/user/${data.userId}/request-plant`, {
        photoUrl: requestPreview
      });
      setRequestMsg("Request sent successfully! Admin will review it soon.");
      setRequestFile(null);
      setRequestPreview(null);
    } catch (err) {
      console.error(err);
      setRequestMsg("Failed to send request.");
    }
  };

  const handleAddFromBrochure = async (plantId) => {
    try {
      await axios.put(`http://localhost:9090/api/user/${data.userId}/plants/${plantId}/bought`, { bought: true });
      setBrochureMsg("Plant efficiently added to your collection! Refreshing...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      setBrochureMsg("Failed to add plant.");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-success" role="status" style={{width: '3rem', height: '3rem'}}></div>
    </div>
  );

  const getCountdownText = (reminderDateStr, type) => {
    const reminderTime = new Date(reminderDateStr).getTime();
    const now = new Date().getTime();
    const diffHours = (reminderTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) return `${type} is overdue!`;
    if (diffHours < 24) return `${type} in ${Math.round(diffHours)} hrs`;
    const days = Math.round(diffHours / 24);
    return `${type} in ${days} day${days > 1 ? 's' : ''}`;
  };

  const pendingReminders = data.reminders.filter(r => !r.completed);

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="fade-in">
            <h2 className="fw-bolder mb-4" style={{ color: 'var(--color-primary-dark)' }}>My Dashboard</h2>
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div 
                  className="glass-card h-100 d-flex align-items-center p-4 cursor-pointer" 
                  onClick={() => setActivePage("plants")}
                  style={{ cursor: "pointer", borderLeft: "5px solid var(--color-primary)" }}
                >
                  <div className="rounded-circle p-4 me-4 bg-success bg-opacity-10 text-success">
                    <i className="fas fa-leaf fa-2x"></i>
                  </div>
                  <div>
                    <h1 className="mb-0 fw-bolder text-dark display-5">{data.totalPlants}</h1>
                    <p className="text-muted mb-0 fw-medium">My Plants</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div 
                  className="glass-card h-100 d-flex align-items-center p-4 cursor-pointer" 
                  onClick={() => setActivePage("reminders")}
                  style={{ cursor: "pointer", borderLeft: "5px solid var(--color-secondary)" }}
                >
                  <div className="rounded-circle p-4 me-4 bg-info bg-opacity-10 text-info">
                    <i className="fas fa-bell fa-2x"></i>
                  </div>
                  <div>
                    <h1 className="mb-0 fw-bolder text-dark display-5">{pendingReminders.length}</h1>
                    <p className="text-muted mb-0 fw-medium">Active Reminders</p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="fw-bold mb-3"><i className="fas fa-history text-primary me-2"></i>Recent Reminders</h4>
            <div className="glass-card p-0 overflow-hidden">
              {data.reminders.length === 0 ? (
                <div className="p-5 text-center text-muted">No recorded reminders yet. Add a plant to get started!</div>
              ) : (
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="px-4 py-3 border-0 text-uppercase fw-bold text-muted" style={{ fontSize: '0.8rem' }}>Plant Name</th>
                      <th className="py-3 border-0 text-uppercase fw-bold text-muted" style={{ fontSize: '0.8rem' }}>Type</th>
                      <th className="py-3 border-0 text-uppercase fw-bold text-muted" style={{ fontSize: '0.8rem' }}>Due Time</th>
                      <th className="px-4 py-3 border-0 text-uppercase fw-bold text-muted text-end" style={{ fontSize: '0.8rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReminders.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-muted">No pending reminders.</td></tr> : pendingReminders.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 fw-medium">{r.plantName}</td>
                        <td className="py-3"><span className="badge bg-info text-dark rounded-pill px-2 shadow-sm">{r.type}</span></td>
                        <td className="py-3 text-muted"><i className="far fa-calendar-alt me-2"></i>{new Date(r.reminderTime).toLocaleString()}</td>
                        <td className="px-4 py-3 text-end">
                          {r.completed 
                            ? <span className="badge bg-success rounded-pill px-3 py-2"><i className="fas fa-check me-1"></i>Done</span> 
                            : <span className="badge bg-warning text-dark rounded-pill px-3 py-2"><i className="fas fa-clock me-1"></i>Pending</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case "plants":
        return (
          <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bolder mb-0" style={{ color: 'var(--color-primary-dark)' }}>My Plant Collection</h2>
              <button className="btn btn-primary" onClick={() => setActivePage("brochure")}><i className="fas fa-plus me-2"></i>Add Plant</button>
            </div>
            
            <div className="glass-card p-0 overflow-hidden">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="py-3">Name</th>
                    <th className="px-4 py-3">Added On</th>
                  </tr>
                </thead>
                <tbody>
                  {data.plants.length === 0 ? <tr><td colSpan="3" className="text-center py-4 text-muted">No plants... yet!</td></tr> : 
                   data.plants.map((plant) => (
                    <tr key={plant.id}>
                      <td className="px-4 fw-medium text-muted">#{plant.id}</td>
                      <td className="fw-bold text-dark"><i className="fas fa-leaf text-success me-2"></i>{plant.name}</td>
                      <td className="px-4 text-muted">{new Date(plant.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "reminders":
        return (
          <div className="fade-in">
            <h2 className="fw-bolder mb-4" style={{ color: 'var(--color-primary-dark)' }}>All My Reminders</h2>
            <div className="glass-card p-0 overflow-hidden">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light bg-opacity-50">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="py-3">Plant Name</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Time</th>
                    <th className="px-4 py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReminders.length === 0 ? <tr><td colSpan="5" className="text-center py-4 text-muted">No active reminders found.</td></tr> :
                   pendingReminders.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 fw-medium text-muted">#{r.id.substring(0, 5)}</td>
                      <td className="fw-bold">{r.plantName || "Your Plant"}</td>
                      <td><span className="badge bg-info text-dark rounded-pill px-2">{r.type}</span></td>
                      <td className="text-muted"><i className="far fa-clock me-2"></i>{new Date(r.reminderTime).toLocaleString()}</td>
                      <td className="px-4 text-end">
                        {r.completed 
                          ? <span className="text-success fw-bold me-3"><i className="fas fa-check-circle me-1"></i>Done</span> 
                          : <button className="btn btn-sm btn-success rounded-pill px-3 shadow-sm" onClick={() => markReminderDone(r.id)}>
                              <i className="fas fa-check me-1"></i> Mark Done
                            </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "brochure":
        return (
          <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bolder mb-0" style={{ color: 'var(--color-primary-dark)' }}>Plant Brochure</h2>
            </div>
            {brochureMsg && <div className="alert alert-success shadow-sm fw-bold">{brochureMsg}</div>}
            <div className="row g-4">
              {brochure.length === 0 ? <p className="text-muted">No plants available in the global brochure yet. Ask Admin to add some!</p> :
               brochure.map(p => (
                 <div className="col-md-4" key={p.id}>
                   <div className="glass-card text-center p-4">
                     {p.photoUrl && <img src={p.photoUrl} alt={p.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '15px' }} />}
                     <h4 className="fw-bold">{p.name}</h4>
                     <p className="text-muted mb-2"><span className="badge bg-secondary">{p.type}</span></p>
                     <p style={{ fontSize: '0.9rem' }} className="mb-3">
                       <i className="fas fa-tint text-info me-1"></i> {p.wateringFrequency} <br/>
                       <i className="fas fa-seedling text-warning me-1"></i> {p.fertilizingFrequency}
                     </p>
                     <button className="btn btn-sm btn-success w-100 rounded-pill" onClick={() => handleAddFromBrochure(p.id)}>
                       Add to Collection
                     </button>
                   </div>
                 </div>
               ))
              }
            </div>
          </div>
        );
      case "request":
        return (
          <div className="fade-in">
            <h2 className="fw-bolder mb-4" style={{ color: 'var(--color-primary-dark)' }}>Request Plant Identification</h2>
            <div className="glass-card" style={{ maxWidth: '600px' }}>
              <p className="text-muted mb-4">Upload a photo of your plant. The Admin will recognize it and add it to the brochure so you can track it!</p>
              <form onSubmit={handleRequestSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Plant Photo</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} required />
                </div>
                {requestPreview && (
                  <div className="mb-3 text-center">
                    <img src={requestPreview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '10px' }} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={!requestPreview}>Send Request to Admin</button>
                {requestMsg && <div className="mt-3 alert alert-info">{requestMsg}</div>}
              </form>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="fade-in">
            <h2 className="fw-bolder mb-4" style={{ color: 'var(--color-primary-dark)' }}>Account Settings</h2>
            <div className="glass-card" style={{ maxWidth: "500px" }}>
              <div className="d-flex flex-column gap-3 mt-2">
                <button 
                  className={`btn ${darkMode ? 'btn-light' : 'btn-dark'} btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm`}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <><i className="fas fa-sun text-warning"></i> Switch to Light Mode</> : <><i className="fas fa-moon"></i> Switch to Dark Mode</>}
                </button>
                <button 
                  className="btn btn-outline-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2 border-2"
                  onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`d-flex min-vh-100 fade-in ${darkMode ? 'bg-dark text-white' : ''}`}>
      {/* Sidebar - Used index.css .sidebar glassmorphism */}
      <aside className="sidebar shadow-lg" style={{ minWidth: "250px", padding: "20px" }}>
        <div className="text-center mb-5 mt-3">
          <h3 className="fw-bolder text-white d-flex align-items-center justify-content-center gap-2">
            <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
              <i className="fas fa-seedling text-success"></i>
            </div>
            PlantPal
          </h3>
        </div>
        <nav className="d-flex flex-column gap-2">
          {[
            { name: "Dashboard", icon: <FaHome />, key: "dashboard", path: "#" },
            { name: "My Plants", icon: <FaLeaf />, key: "plants", path: "#" },
            { name: "Brochure", icon: <i className="fas fa-book-open"></i>, key: "brochure", path: "#" },
            { name: "My Reminders", icon: <FaBell />, key: "reminders", path: "#" },
            { name: "Request Plant", icon: <i className="fas fa-camera"></i>, key: "request", path: "#" },
            { name: "Settings", icon: <FaCog />, key: "settings", path: "#" },
          ].map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`sidebar-link d-flex align-items-center gap-3 text-decoration-none p-3 ${activePage === item.key ? "active" : ""}`}
              onClick={(e) => { e.preventDefault(); setActivePage(item.key); }}
            >
              <div style={{ fontSize: '1.2rem', width: '25px', textAlign: 'center' }}>{item.icon}</div>
              <span className="fw-medium">{item.name}</span>
            </Link>
          ))}
          <div className="mt-auto">
            <button onClick={handleLogout} className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 border-0 bg-white bg-opacity-10 text-white" style={{ transition: 'all 0.3s' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-5 overflow-auto position-relative">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="ms-auto d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-user text-primary"></i>
            </div>
            <span className="fw-bold">{data.username}</span>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
// Forced recompile to clear stuck Webpack/ESLint cache
