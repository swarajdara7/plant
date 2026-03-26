// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaLeaf, FaBell, FaChartLine, FaCog } from "react-icons/fa";

const AdminDashboard = ({ activeTab = "dashboard" }) => {
  const [activePage, setActivePage] = useState(activeTab);

  useEffect(() => {
    setActivePage(activeTab);
  }, [activeTab]);
  const [data, setData] = useState({
    totalUsers: 0,
    totalPlants: 0,
    totalReminders: 0,
    users: [],
    plants: [],
    reminders: [],
    requests: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats from /admin/stats
        const statsRes = await axios.get("http://localhost:9090/api/admin/stats");

        // Fetch requests separately
        let requestsData = [];
        try {
          const reqRes = await axios.get("http://localhost:9090/api/admin/requests");
          requestsData = reqRes.data;
        } catch(e) { console.error(e); }

        setData({
          totalUsers: statsRes.data.totalUsers,
          totalPlants: statsRes.data.totalPlants,
          totalReminders: statsRes.data.totalReminders,
          users: statsRes.data.users,
          plants: statsRes.data.plants,
          reminders: statsRes.data.reminders,
          requests: requestsData,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={styles.loading}>Loading dashboard...</p>;

  const approveRequest = async (id) => {
    try {
      await axios.post(`http://localhost:9090/api/admin/requests/${id}/approve`);
      alert("Request approved! You can now add this plant to the brochure (Identification AI logic can be tied to this).");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to approve");
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <h1 style={styles.heading}>Welcome to PlantPal Admin Dashboard</h1>
            <div style={styles.cardsContainer}>
              <div className="dashboard-card" style={styles.card}>
                <h2>{data.totalUsers}</h2>
                <p>Total Users</p>
              </div>
              <div className="dashboard-card" style={styles.card}>
                <h2>{data.totalPlants}</h2>
                <p>Total Plants</p>
              </div>
              <div className="dashboard-card" style={styles.card}>
                <h2>{data.totalReminders}</h2>
                <p>Total Reminders</p>
              </div>
            </div>
          </>
        );
      case "users":
        return (
          <>
            <h2 style={styles.heading}>Users</h2>
            <table className="data-table" style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username || user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case "plants":
        return (
          <>
            <h2 style={styles.heading}>Plants</h2>
            <table className="data-table" style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.plants.map((plant) => (
                  <tr key={plant.id}>
                    <td>{plant.id}</td>
                    <td>{plant.name}</td>
                    <td>{plant.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case "reminders":
        return (
          <>
            <h2 style={styles.heading}>Reminders</h2>
            <table className="data-table" style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plant</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.reminders.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.plantName}</td>
                    <td>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case "requests":
        return (
          <>
            <h2 style={styles.heading}>Plant Identification Requests</h2>
            <table className="data-table" style={{...styles.table, background: '#fff', borderRadius: '8px', overflow: 'hidden'}}>
              <thead style={{background: '#f0f0f0'}}>
                <tr>
                  <th>User</th>
                  <th>Photo</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center', padding: '20px'}}>No pending user requests</td></tr> : 
                 data.requests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.username}</strong></td>
                    <td><img src={req.photoUrl} alt="Request" style={{width: '60px', height: '60px', borderRadius:'10px', objectFit:'cover', border: '1px solid #ccc'}}/></td>
                    <td><span style={{padding: '5px 12px', background: req.status==='PENDING' ? '#ffd54f' : req.status==='APPROVED'?'#81c784':'#e57373', borderRadius: '15px', color:'#000', fontSize:'0.85rem', fontWeight:'bold'}}>{req.status}</span></td>
                    <td>
                      {req.status === 'PENDING' && (
                        <button style={{background: '#2e7d32', color: 'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}} onClick={() => approveRequest(req.id)}>
                          Approve & Identify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case "analytics":
        return <h2 style={styles.heading}>Analytics coming soon...</h2>;
      case "settings":
        return (
          <div className="fade-in">
            <h2 style={styles.heading}>Admin Settings</h2>
            <div style={{ ...styles.card, maxWidth: "500px", padding: "30px", textAlign: "left" }}>
              <h3 style={{ marginBottom: "20px", color: "#2e7d32" }}>System Configuration</h3>
              <p style={{ color: "#666", marginBottom: "30px", fontSize: "1.1rem" }}>
                Settings configuration is complete! Use the options below to manage your admin session.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <button 
                  style={{ padding: "12px", border: "none", borderRadius: "5px", backgroundColor: "#2e7d32", color: "white", fontSize: "1rem", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                  onClick={() => alert("Theme preferences saved.")}
                >
                  <FaCog /> Preferences
                </button>
                
                <button 
                  style={{ padding: "12px", border: "2px solid #d32f2f", borderRadius: "5px", backgroundColor: "transparent", color: "#d32f2f", fontSize: "1rem", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                  onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
                >
                  Logout Administrator
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
    <div className="fade-in" style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>PlantPal Admin</h2>
        <nav style={styles.nav}>
          {[
            { name: "Dashboard", icon: <FaHome />, key: "dashboard", path: "/admin/dashboard" },
            { name: "Users", icon: <FaUsers />, key: "users", path: "/admin/users" },
            { name: "Plants", icon: <FaLeaf />, key: "plants", path: "/admin/plants" },
            { name: "Reminders", icon: <FaBell />, key: "reminders", path: "#" },
            { name: "Requests", icon: <FaLeaf />, key: "requests", path: "#" },
            { name: "Analytics", icon: <FaChartLine />, key: "analytics", path: "#" },
            { name: "Settings", icon: <FaCog />, key: "settings", path: "#" },
            { name: "Add Plants", icon: <FaLeaf />, key: "addplants", path: "/admin/plants/add" }
          ].map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={activePage === item.key ? "sidebar-link active" : "sidebar-link"} style={activePage === item.key ? styles.activeLink : styles.link}
              onClick={(e) => { if(item.path==="#") e.preventDefault(); setActivePage(item.key); }}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>{renderContent()}</main>
    </div>
  );
};

// Internal CSS
const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: {
    width: "250px",
    backgroundColor: "#2e7d32",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    color: "#fff",
    textDecoration: "none",
    transition: "0.3s",
  },
  activeLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    color: "#fff",
    backgroundColor: "#1b5e20",
    fontWeight: "bold",
    textDecoration: "none",
  },
  main: { flex: 1, padding: "20px", backgroundColor: "#f5f5f5" },
  heading: { marginBottom: "20px" },
  cardsContainer: { display: "flex", gap: "20px", marginTop: "20px" },
  card: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  "table th, table td": { border: "1px solid #ddd", padding: "8px" },
  loading: { textAlign: "center", marginTop: "50px", fontSize: "18px" },
};

export default AdminDashboard;
