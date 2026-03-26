// src/pages/AdminReminders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaLeaf, FaBell, FaChartLine, FaCog } from "react-icons/fa";

const AdminReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);

  const [newReminder, setNewReminder] = useState({
    plantId: "",
    userId: "",
    type: "",
    reminderTime: "",
    completed: false,
  });

  useEffect(() => {
    fetchReminders();
    fetchUsersAndPlants();
  }, []);

  const fetchUsersAndPlants = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        axios.get("http://localhost:9090/api/admin/users"),
        axios.get("http://localhost:9090/api/admin/plants")
      ]);
      setUsers(uRes.data);
      setPlants(pRes.data);
    } catch (err) {
      console.error("Error fetching users or plants", err);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/admin/reminders");
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewReminder({
      ...newReminder,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddReminder = async () => {
    try {
      await axios.post("http://localhost:9090/api/admin/reminders", newReminder);
      setNewReminder({
        plantId: "",
        userId: "",
        type: "",
        reminderTime: "",
        completed: false,
      });
      fetchReminders();
    } catch (err) {
      console.error("Error adding reminder", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9090/api/admin/reminders/${id}`);
      fetchReminders();
    } catch (err) {
      console.error("Error deleting reminder", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="d-flex min-vh-100 fade-in">
      {/* Sidebar - Glassmorphism style inside index.css handles .sidebar */}
      <aside className="sidebar shadow-lg" style={{ minWidth: "250px", padding: '20px' }}>
        <div className="text-center mb-5 mt-3">
           <h3 className="fw-bolder text-white d-flex align-items-center justify-content-center gap-2">
             <i className="fas fa-leaf text-success"></i> Admin
           </h3>
        </div>
        <nav className="d-flex flex-column gap-2 h-100">
          <div>
            {[
              { name: "Dashboard", icon: <FaHome />, key: "dashboard", path: "/admin/dashboard" },
              { name: "Users", icon: <FaUsers />, key: "users", path: "/admin/users" },
              { name: "Plants", icon: <FaLeaf />, key: "plants", path: "/admin/plants" },
              { name: "Reminders", icon: <FaBell />, key: "reminders", path: "/admin/reminders" },
              { name: "Analytics", icon: <FaChartLine />, key: "analytics", path: "/admin/analytics" },
              { name: "Settings", icon: <FaCog />, key: "settings", path: "/admin/settings" },
            ].map(item => (
              <Link
                key={item.key}
                to={item.path}
                className={`sidebar-link d-flex align-items-center gap-3 text-decoration-none p-3 ${item.key === "reminders" ? "active" : ""}`}
              >
                {item.icon} <span className="fw-medium">{item.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-auto">
            <button onClick={handleLogout} className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 border-0 bg-white bg-opacity-10 text-white" style={{ transition: 'all 0.3s' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-5 overflow-auto">
        <div className="d-flex justify-content-between align-items-center mb-5">
           <div>
             <h2 className="fw-bolder mb-1" style={{ color: "var(--color-primary-dark)" }}>Manage Reminders</h2>
             <p className="text-muted">Create and manage plant care reminders across the system.</p>
           </div>
        </div>

        {/* Add Reminder Form */}
        <div className="glass-card mb-5">
          <h5 className="fw-bold mb-4"><i className="fas fa-plus-circle text-primary me-2"></i>Add New Reminder</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small text-muted fw-bold">Select User</label>
              <select className="form-select form-control" name="userId" value={newReminder.userId} onChange={handleChange}>
                <option value="">Choose...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-bold">Select Plant</label>
              <select className="form-select form-control" name="plantId" value={newReminder.plantId} onChange={handleChange}>
                <option value="">Choose...</option>
                {(() => {
                  if (!newReminder.userId) return plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>);
                  const selectedUser = users.find(u => u.id === newReminder.userId);
                  const userPlantIds = selectedUser?.plantIds || [];
                  const userPlants = plants.filter(p => p.userId === newReminder.userId || userPlantIds.includes(p.id));
                  
                  if (userPlants.length === 0) {
                      // If user has absolutely no plants, return all global plants so Admin can still assign something 
                      // (or just show a disabled option "User has no plants")
                      return <option disabled>User has no plants</option>;
                  }
                  
                  return userPlants.map(p => <option key={p.id} value={p.id}>{p.name}</option>);
                })()}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-bold">Type</label>
              <input className="form-control" type="text" name="type" placeholder="e.g. Watering" value={newReminder.type} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-bold">Time</label>
              <input className="form-control" type="datetime-local" name="reminderTime" value={newReminder.reminderTime} onChange={handleChange} />
            </div>
            <div className="col-md-2 d-flex flex-column gap-2">
              <div className="form-check pt-2">
                <input className="form-check-input" type="checkbox" name="completed" id="completedCheck" checked={newReminder.completed} onChange={handleChange} />
                <label className="form-check-label text-muted" htmlFor="completedCheck">Completed</label>
              </div>
              <button className="btn btn-primary w-100" onClick={handleAddReminder}>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Reminders Table */}
        <div className="glass-card p-0 overflow-hidden">
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-light bg-opacity-50">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="py-3">Plant Name</th>
                <th className="py-3">User Name</th>
                <th className="py-3">Type</th>
                <th className="py-3">Time</th>
                <th className="py-3">Status</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No reminders found</td></tr>
              ) : (
                reminders.map((reminder) => {
                  const plantName = plants.find(p => p.id === reminder.plantId)?.name || 'Unknown Plant';
                  const userName = users.find(u => u.id === reminder.userId)?.username || 'Unknown User';
                  
                  return (
                    <tr key={reminder.id}>
                      <td className="px-4 fw-medium text-muted">#{reminder.id.substring(0,8)}...</td>
                      <td className="fw-bold">{plantName}</td>
                      <td>{userName}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">{reminder.type}</span></td>
                      <td>{reminder.reminderTime?.replace("T", " ")}</td>
                      <td>
                        {reminder.completed 
                          ? <span className="text-success fw-bold"><i className="fas fa-check-circle me-1"></i>Done</span> 
                          : <span className="text-warning fw-bold"><i className="fas fa-clock me-1"></i>Pending</span>}
                      </td>
                      <td className="px-4 text-end">
                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(reminder.id)}>
                          <i className="fas fa-trash-alt me-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminReminders;
