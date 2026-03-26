import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER", // default role
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:9090/api/register", formData);
      alert(response.data);
      navigate("/login"); // redirect to login page
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      margin: 0,
      padding: 0,
      boxSizing: "border-box",
    },
    card: {
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
      width: "100%",
      maxWidth: "450px",
      padding: "40px",
      position: "relative",
      overflow: "hidden",
      animation: "cardAppear 0.6s ease-out",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    headerH2: {
      color: "#333",
      fontWeight: 700,
      marginBottom: "8px",
      fontSize: "28px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "15px",
    },
    input: {
      padding: "16px",
      border: "2px solid #e6e6e6",
      borderRadius: "10px",
      fontSize: "16px",
      outline: "none",
      background: "#f9f9f9",
      transition: "all 0.3s ease",
    },
    inputError: {
      borderColor: "#ff4757",
    },
    errorText: {
      color: "#ff4757",
      fontSize: "14px",
      marginBottom: "10px",
    },
    submitBtn: {
      background: "linear-gradient(to right, #667eea, #764ba2)",
      color: "white",
      border: "none",
      padding: "16px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      marginTop: "10px",
      transition: "all 0.3s ease",
    },
    submitBtnDisabled: {
      cursor: "not-allowed",
      opacity: 0.7,
    },
    spinner: {
      width: "18px",
      height: "18px",
      border: "2px solid transparent",
      borderTop: "2px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    keyframes: `
      @keyframes cardAppear {
        0% { opacity: 0; transform: scale(0.9) translateY(30px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
  };

  return (
    <div className="fade-in" style={styles.container}>
      <style>{styles.keyframes}</style>
      <div className="text-center mb-4" style={{textAlign: "center", marginBottom: "30px"}}>
        <h1 style={{color: 'white', fontSize: '3.5rem', fontWeight: 'bold', textShadow: '2px 3px 6px rgba(0,0,0,0.3)', letterSpacing: '4px', margin: 0}}>PLANTPAL</h1>
      </div>
      <div className="dashboard-card" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.headerH2}>Register</h2>
          <p>Create your PlantPal account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={styles.formGroup}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.username ? styles.inputError : {}),
              }}
            />
            {errors.username && <div style={styles.errorText}>{errors.username}</div>}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
            />
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div>

          {/* Role */}
          <div style={styles.formGroup}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                ...styles.input,
                cursor: "pointer",
              }}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(isSubmitting ? styles.submitBtnDisabled : {}),
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span style={styles.spinner}></span> : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
