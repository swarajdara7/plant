// AddPlant.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaLeaf, FaBell, FaChartLine, FaCog } from "react-icons/fa";

const AddPlant = ({ onPlantAdded }) => {
  const [plant, setPlant] = useState({
    name: "",
    type: "",
    photoUrl: "",
    wateringFrequency: "",
    fertilizingFrequency: "",
    userId: ""
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [recognizing, setRecognizing] = useState(false);

  // Handle image upload and recognition
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRecognizing(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:9090/api/user/recognize-plant", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const data = res.data;
      setPlant(prev => ({
        ...prev,
        name: data.speciesName || prev.name,
        wateringFrequency: data.wateringFrequency || prev.wateringFrequency,
        fertilizingFrequency: data.fertilizingFrequency || prev.fertilizingFrequency
      }));
      // Show some feedback internally
    } catch (err) {
      console.error("Error recognizing plant:", err);
      alert("Failed to recognize plant from image.");
    } finally {
      setRecognizing(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlant({ ...plant, [name]: value });

    if (name === "photoUrl") setPreview(value); // image preview
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!plant.name || !plant.photoUrl) {
      alert("Please provide a plant name and image URL!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:9090/api/admin/plants", plant);
      alert(`Plant "${res.data.name}" added successfully!`);
      setPlant({
        name: "",
        type: "",
        photoUrl: "",
        wateringFrequency: "",
        fertilizingFrequency: "",
        userId: ""
      });
      setPreview("");
      if (onPlantAdded) onPlantAdded(res.data);
    } catch (err) {
      console.error("Error adding plant:", err);
      alert("Failed to add plant. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.layoutContainer}>
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
      <div style={styles.container}>
        <h2 style={styles.heading}>Add New Plant</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
        <label style={{ fontSize: '14px', color: '#555', marginTop: '10px' }}>Auto-fill plant details from image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={recognizing}
          style={styles.input}
        />
        {recognizing && <p style={{color: 'orange', fontSize: '14px', margin: 0}}>Recognizing plant... 🌿</p>}

        <input
          type="text"
          name="name"
          placeholder="Plant Name"
          value={plant.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="type"
          placeholder="Plant Type (optional)"
          value={plant.type}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="photoUrl"
          placeholder="Image URL"
          value={plant.photoUrl}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="wateringFrequency"
          placeholder="Watering Frequency (optional)"
          value={plant.wateringFrequency}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="fertilizingFrequency"
          placeholder="Fertilizing Frequency (optional)"
          value={plant.fertilizingFrequency}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="userId"
          placeholder="Owner ID (optional)"
          value={plant.userId}
          onChange={handleChange}
          style={styles.input}
        />

        {/* Image Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=Invalid+URL";
            }}
            style={styles.preview}
          />
        )}

        <button type="submit" disabled={loading} className="action-btn" style={styles.button}>
          {loading ? "Adding..." : "Add Plant"}
        </button>
      </form>
    </div>
    </main>
    </div>
  );
};

// Styles
const styles = {
  layoutContainer: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5" },
  sidebar: { width: "250px", backgroundColor: "#2e7d32", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", boxSizing: "border-box" },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  link: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", textDecoration: "none", transition: "0.3s" },
  activeLink: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", backgroundColor: "#1b5e20", fontWeight: "bold", textDecoration: "none" },
  main: { flex: 1, padding: "20px", width: "calc(100% - 250px)" },
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    maxWidth: "500px",
    margin: "20px auto",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  heading: { marginBottom: "15px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  preview: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px"
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#2e7d32",
    color: "#fff",
    cursor: "pointer"
  }
};

export default AddPlant;
