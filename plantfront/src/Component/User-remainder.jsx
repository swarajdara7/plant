// src/components/UserReminders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaLeaf, FaBell, FaCog } from "react-icons/fa";

const UserReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const userId = localStorage.getItem("userId"); // ✅ use logged-in userId
        if (!userId) {
          console.error("⚠️ No userId found in localStorage");
          setLoading(false);
          return;
        }

        // ✅ Fetch reminders for this user
        const res = await axios.get(
          `http://localhost:9090/api/user/${userId}/reminders`
        );
        setReminders(res.data);
      } catch (err) {
        console.error("Error fetching reminders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleMarkDone = async (reminderId, plantName) => {
    try {
      await axios.put(`http://localhost:9090/api/user/reminders/${reminderId}/completed`);
      alert(`Thanks to Admin for reminding you! Your plant '${plantName || "your plant"}' has been watered!`);
      // Update UI to either remove it or mark it as completed dynamically
      setReminders((prev) => prev.filter(rem => rem.id !== reminderId));
    } catch (err) {
      console.error("Error updating reminder:", err);
      alert("Failed to mark reminder as completed.");
    }
  };

  if (loading) return <p style={styles.loading}>Loading reminders...</p>;

  return (
    <div className="fade-in" style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>PlantPal User</h2>
        <nav style={styles.nav}>
          {[
            { name: "Dashboard", icon: <FaHome />, key: "dashboard", path: "/user/dashboard" },
            { name: "My Plants", icon: <FaLeaf />, key: "plants", path: "/user/plants" },
            { name: "My Reminders", icon: <FaBell />, key: "reminders", path: "/user/reminders" },
            { name: "Settings", icon: <FaCog />, key: "settings", path: "/user/settings" },
          ].map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={item.key === "reminders" ? "sidebar-link active" : "sidebar-link"} 
              style={item.key === "reminders" ? styles.activeLink : styles.link}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <h2 style={styles.heading}>⏰ My Reminders</h2>

      {reminders.length === 0 ? (
        <p style={styles.noReminders}>No reminders found.</p>
      ) : (
        <div style={styles.cardGrid}>
          {reminders.filter(rem => !rem.completed).map((rem) => (
            <div key={rem.id} className="dashboard-card" style={styles.card}>
              <h3 style={styles.cardTitle}>{rem.type || "Reminder"}</h3>
              <p>
                <strong>Plant:</strong> {rem.plantName || rem.plantId}
              </p>
              <p>
                <strong>Reminder Time:</strong>{" "}
                {rem.reminderTime
                  ? new Date(rem.reminderTime).toLocaleString()
                  : "-"}
              </p>
              <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={styles.pending}>⏳ Pending</p>
                <button
                  className="action-btn" style={styles.doneBtn}
                  onClick={() => handleMarkDone(rem.id, rem.plantName)}
                >
                  ✅ Mark as Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
};

// ============ Internal CSS ============
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif"
  },
  sidebar: { width: "250px", backgroundColor: "#2e7d32", color: "#fff", padding: "20px", display: "flex", flexDirection: "column" },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  link: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", textDecoration: "none", transition: "0.3s" },
  activeLink: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", backgroundColor: "#1b5e20", fontWeight: "bold", textDecoration: "none" },
  main: { flex: 1, padding: "20px", backgroundColor: "#f5f5f5" },
  heading: {
    marginBottom: "20px",
    fontSize: "26px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#1976d2",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
  },
  noReminders: {
    textAlign: "center",
    fontSize: "18px",
    color: "#777",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: "20px",
    textAlign: "left",
    transition: "transform 0.2s",
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#1976d2",
  },
  completed: {
    color: "green",
    fontWeight: "bold",
  },
  pending: {
    color: "orange",
    fontWeight: "bold",
  },
  doneBtn: {
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};

export default UserReminders;
