import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaLeaf, FaBell, FaChartLine, FaCog } from "react-icons/fa";

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("plants");

  // Fetch all plants
  const fetchPlants = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/admin/plants");
      setPlants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchUsers();

    // Poll every 5 seconds to get updated bought status
    const interval = setInterval(() => {
      fetchPlants();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getUsername = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : "N/A";
  };

  if (loading) return <p style={styles.loading}>Loading plants...</p>;

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
            { name: "Reminders", icon: <FaBell />, key: "reminders", path: "/admin/reminders" },
            { name: "Analytics", icon: <FaChartLine />, key: "analytics", path: "/admin/analytics" },
            { name: "Settings", icon: <FaCog />, key: "settings", path: "/admin/settings" },
          ].map(item => (
            <Link
              key={item.key}
              to={item.path}
              className={activePage === item.key ? "sidebar-link active" : "sidebar-link"} style={activePage === item.key ? styles.activeLink : styles.link}
              onClick={() => setActivePage(item.key)}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <h2 style={styles.heading}>All Plants</h2>
        <div style={styles.cardContainer}>
          {plants.map(plant => (
            <div key={plant.id} className="dashboard-card" style={styles.card}>
              <img
                src={plant.photoUrl || "https://via.placeholder.com/150?text=No+Image"}
                alt={plant.name}
                className="card-image-anim" style={styles.cardImage}
              />
              <div style={styles.badge}>{plant.type || "Unknown"}</div>
              <h3 style={styles.cardTitle}>{plant.name}</h3>
              <p style={styles.cardOwner}><strong>Owner:</strong> {getUsername(plant.userId)}</p>
              <p style={styles.cardInfo}><strong>Water:</strong> {plant.wateringFrequency || "N/A"}</p>
              <p style={styles.cardInfo}><strong>Fertilize:</strong> {plant.fertilizingFrequency || "N/A"}</p>

              {/* Bought / Not Bought */}
              <p style={plant.bought ? styles.bought : styles.notBought}>
                {plant.bought ? "✔️ Bought" : "❌ Not Bought"}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: { width: "250px", backgroundColor: "#2e7d32", color: "#fff", padding: "20px", display: "flex", flexDirection: "column" },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  link: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", textDecoration: "none", transition: "0.3s" },
  activeLink: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", backgroundColor: "#1b5e20", fontWeight: "bold", textDecoration: "none" },
  main: { flex: 1, padding: "20px", backgroundColor: "#f5f5f5" },
  heading: { marginBottom: "20px" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#fff", borderRadius: "10px", padding: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textAlign: "center" },
  cardImage: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginBottom: "10px" },
  badge: { display: "inline-block", backgroundColor: "#2e7d32", color: "#fff", borderRadius: "12px", padding: "3px 10px", fontSize: "12px", marginBottom: "10px" },
  cardTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "5px" },
  cardOwner: { fontSize: "14px", color: "#555", marginBottom: "5px" },
  cardInfo: { fontSize: "13px", color: "#555", marginBottom: "5px" },
  bought: { color: "green", fontWeight: "bold" },
  notBought: { color: "red", fontWeight: "bold" },
  loading: { textAlign: "center", marginTop: "50px", fontSize: "18px" },
};

export default AdminPlants;
