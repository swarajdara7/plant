import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Component/Home";
import Login from "./Component/Login";
import Register from "./Component/Register";
import AdminDashboard from "./Component/Admin-dashboard";
import UserDashboard from "./Component/User-dashboard";
import AdminPlants from "./Component/Admin-plants";
import AddPlant from "./Component/Add-plants";
import AdminUsers from "./Component/Admin-Users";
import AdminReminders from "./Component/Admin-Reminder";
import AdminAnalytics from "./Component/Admin-analytics";
import UserPlants from "./Component/User-plants";
import UserReminders from "./Component/User-remainder";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard  />} />
        <Route path="/user/settings" element={<UserDashboard  />} />
        <Route path="/admin/plants" element={<AdminPlants />} />
        <Route path="/admin/plants/add" element={<AddPlant />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reminders" element={<AdminReminders />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/user/plants" element={<UserPlants />} />
        <Route path="/user/reminders" element={<UserReminders />} />
        {/* other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
