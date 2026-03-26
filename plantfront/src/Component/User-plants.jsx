// src/components/UserPlants.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaLeaf, FaBell, FaCog } from "react-icons/fa";

const UserPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myPlantIds, setMyPlantIds] = useState([]);

  // ✅ Fetch all plants and user profile
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const resPlants = await axios.get("http://localhost:9090/api/user/plants");
        const resUser = await axios.get(`http://localhost:9090/api/user/${userId}`);
        const userPlantIds = resUser.data.plantIds || [];

        // Merge bought status
        const mergedPlants = resPlants.data.map(p => ({
           ...p,
           bought: userPlantIds.includes(p.id)
        }));

        setPlants(mergedPlants);
        setMyPlantIds(userPlantIds);
      } catch (err) {
        console.error("Error fetching plants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // ✅ Toggle Buy / Not Bought
  const toggleBought = async (plantId, currentStatus) => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.put(
        `http://localhost:9090/api/user/${userId}/plants/${plantId}/bought`,
        { bought: !currentStatus }
      );

      // update state instantly
      setPlants((prev) =>
        prev.map((plant) =>
          plant.id === plantId ? { ...plant, bought: !currentStatus } : plant
        )
      );
    } catch (err) {
      console.error("Error updating plant status:", err);
    }
  };

  if (loading) return <p style={styles.loading}>Loading plants...</p>;

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
              className={item.key === "plants" ? "sidebar-link active" : "sidebar-link"} 
              style={item.key === "plants" ? styles.activeLink : styles.link}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <h2 style={styles.heading}>🌱 My Plants</h2>

      {plants.length === 0 ? (
        <p style={styles.noPlants}>No plants found.</p>
      ) : (
        <div style={styles.cardGrid}>
          {plants.map((plant) => (
            <div key={plant.id} className="dashboard-card" style={styles.card}>
              {/* ✅ Plant Image */}
              {plant.photoUrl && (
                <img src={plant.photoUrl} alt={plant.name} style={styles.image} />
              )}

              {/* ✅ Plant Info */}
              <h3 style={styles.cardTitle}>{plant.name}</h3>
              <p><strong>Type:</strong> {plant.type || "N/A"}</p>
              <p><strong>Watering:</strong> {plant.wateringFrequency || "-"}</p>
              <p><strong>Fertilizing:</strong> {plant.fertilizingFrequency || "-"}</p>

              {/* ✅ Bought Status */}
              <p style={plant.bought ? styles.bought : styles.notBought}>
                {plant.bought ? "✔️ Bought" : "❌ Not Bought"}
              </p>

              {/* ✅ Toggle Button */}
              <button
                className="action-btn" style={styles.button}
                onClick={() => toggleBought(plant.id, plant.bought)}
              >
                {plant.bought ? "Mark as Not Bought" : "Mark as Bought"}
              </button>

              <p>
                <strong>Added On:</strong>{" "}
                {plant.createdAt
                  ? new Date(plant.createdAt).toLocaleDateString()
                  : "-"}
              </p>
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
    color: "#2e7d32",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
  },
  noPlants: {
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
    fontSize: "22px",
    marginBottom: "10px",
    color: "#2e7d32",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  bought: {
    color: "green",
    fontWeight: "bold",
  },
  notBought: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#1976d2",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default UserPlants;
