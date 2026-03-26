// src/pages/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaLeaf, FaBell, FaChartLine, FaCog } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const StatCard = ({ icon, label, value, bgColor, iconColor }) => (
  <div className="stat-card" style={{ backgroundColor: bgColor }}>
    {React.cloneElement(icon, { style: { color: iconColor, fontSize: "2.5rem", marginRight: "1rem" } })}
    <div>
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalPlants: 0, totalReminders: 0 });
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          axios.get("http://localhost:9090/api/admin/stats"),
          axios.get("http://localhost:9090/api/admin/trends"),
        ]);
        setStats(statsRes.data);
        setTrendData(trendsRes.data);
      } catch (err) {
        setError("Failed to fetch analytics. Please check your backend.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  if (error) return <div className="error">{error}</div>;

  const chartData = [
    { name: "Users", count: stats.totalUsers },
    { name: "Plants", count: stats.totalPlants },
    { name: "Reminders", count: stats.totalReminders },
  ];

  const pieColors = ["#059669", "#1D4ED8", "#D97706"];

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
              className={item.key === "analytics" ? "sidebar-link active" : "sidebar-link"} 
              style={item.key === "analytics" ? styles.activeLink : styles.link}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
      <div className="container">
      {/* Stats Cards */}
      <div className="grid">
        <StatCard icon={<FaUsers />} label="Total Users" value={stats.totalUsers} bgColor="#D1FAE5" iconColor="#059669" />
        <StatCard icon={<FaLeaf />} label="Total Plants" value={stats.totalPlants} bgColor="#DBEAFE" iconColor="#1D4ED8" />
        <StatCard icon={<FaBell />} label="Total Reminders" value={stats.totalReminders} bgColor="#FEF3C7" iconColor="#D97706" />
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h3>Bar Chart: Analytics Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="chart-container">
        <h3>Pie Chart: Proportion Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="chart-container">
        <h3>Line Chart: Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#059669" />
            <Line type="monotone" dataKey="plants" stroke="#1D4ED8" />
            <Line type="monotone" dataKey="reminders" stroke="#D97706" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Internal CSS */}
      <style>{`
        .container { padding: 2rem; font-family: Arial, sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { display: flex; align-items: center; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .stat-card:hover { transform: scale(1.05); }
        .stat-label { color: #4B5563; margin: 0; font-size: 1rem; }
        .stat-value { font-size: 1.75rem; font-weight: bold; margin: 0.25rem 0 0; }
        .chart-container { background-color: #ffffff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .chart-container h3 { margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold; }
        .loader-container { display: flex; justify-content: center; align-items: center; height: 300px; }
        .loader { border: 6px solid #f3f3f3; border-top: 6px solid #4F46E5; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error { color: #b91c1c; text-align: center; font-weight: bold; margin-top: 2rem; }
      `}</style>
      </div>
      </main>
    </div>
  );
};

const styles = {
  layoutContainer: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5" },
  sidebar: { width: "250px", backgroundColor: "#2e7d32", color: "#fff", padding: "20px", display: "flex", flexDirection: "column" },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "bold" },
  nav: { display: "flex", flexDirection: "column", gap: "10px" },
  link: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", textDecoration: "none", transition: "0.3s" },
  activeLink: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", cursor: "pointer", borderRadius: "5px", color: "#fff", backgroundColor: "#1b5e20", fontWeight: "bold", textDecoration: "none" },
  main: { flex: 1, padding: "20px", width: "calc(100% - 250px)" },
};

export default AdminAnalytics;
