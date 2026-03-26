import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);
  const plants = [
    {
      name: "Monstera Deliciosa",
      care: "Water every 1-2 weeks, bright indirect light",
      icon: "fa-leaf"
    },
    {
      name: "Snake Plant",
      care: "Water every 2-6 weeks, low to bright light",
      icon: "fa-seedling"
    },
    {
      name: "Pothos",
      care: "Water every 1-2 weeks, any light conditions",
      icon: "fa-tree"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlantIndex((prevIndex) => (prevIndex + 1) % plants.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [plants.length]);

  return (
    <div className="home-wrapper fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <nav className="navbar navbar-expand-lg px-4 py-3 sticky-top">
        <div className="container-fluid max-w-7xl mx-auto d-flex justify-content-between align-items-center w-100">
          <Link to="/" className="navbar-brand d-flex align-items-center text-decoration-none">
            <i className="fas fa-leaf text-success me-2 border p-2 rounded-circle shadow-sm" style={{ borderColor: 'var(--color-primary) !important' }}></i> 
            PlantPal
          </Link>
          <div className="d-flex align-items-center gap-4">
            <Link to="/" className="text-decoration-none text-dark fw-medium nav-link-custom">Home</Link>
            <Link to="/features" className="text-decoration-none text-dark fw-medium nav-link-custom">Features</Link>
            <Link to="/register" className="text-decoration-none text-dark fw-medium nav-link-custom">Register</Link>
            <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm">Login</Link>
          </div>
        </div>
      </nav>

      <style>{`
        .nav-link-custom { transition: var(--transition-smooth); }
        .nav-link-custom:hover { color: var(--color-primary) !important; transform: translateY(-2px); }
        .hero-section { min-height: 80vh; display: flex; align-items: center; position: relative; overflow: hidden; }
        .hero-bg-blob { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%); top: -100px; right: -100px; z-index: -1; border-radius: 50%; filter: blur(40px); }
        .max-w-7xl { max-width: 1280px; }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section container max-w-7xl mx-auto px-4 py-5 w-100">
        <div className="hero-bg-blob"></div>
        <div className="row align-items-center w-100 m-0">
          <div className="col-lg-6 mb-5 mb-lg-0 pe-lg-5">
            <span className="badge bg-success bg-opacity-10 text-success mb-3 px-3 py-2 rounded-pill fw-medium border border-success border-opacity-25">
              🌱 Your Personal Plant Assistant
            </span>
            <h1 className="display-4 fw-bolder mb-4" style={{ color: 'var(--text-dark)', lineHeight: '1.2' }}>
              Never Forget to <br/>
              <span style={{ color: 'var(--color-primary)' }}>Water Your Plants</span> Again
            </h1>
            <p className="lead text-muted mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
              PlantPal uses intelligent tracking and gorgeous dashboards to help you care for your plants with automated reminders, identification tools, and tailored care guides.
            </p>
            <div className="d-flex gap-3">
              <Link to="/register" className="btn btn-primary btn-lg shadow">Get Started Free</Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg bg-white bg-opacity-50">Identify a Plant</Link>
            </div>
          </div>
          
          <div className="col-lg-6 d-flex justify-content-center position-relative">
            <div className="glass-card text-center p-5" style={{ width: '100%', maxWidth: '400px', transform: 'rotate(2deg)' }}>
              <div className="mb-4 d-inline-block p-4 rounded-circle" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <i className={"fas " + plants[currentPlantIndex].icon + " display-1"} style={{ color: 'var(--color-primary)' }}></i>
              </div>
              <h3 className="fw-bold fs-4 mb-2">{plants[currentPlantIndex].name}</h3>
              <p className="text-muted mb-0">{plants[currentPlantIndex].care}</p>
              
              <div className="mt-4 pt-4 border-top" style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
                <div className="d-flex justify-content-center gap-2">
                  {plants.map((_, idx) => (
                    <div key={idx} className="rounded-circle" style={{ width: '8px', height: '8px', background: idx === currentPlantIndex ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)', transition: 'all 0.3s' }}></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="glass-card position-absolute shadow-lg p-3 d-flex align-items-center gap-3" style={{ bottom: '-20px', left: '-20px', borderRadius: '15px' }}>
               <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}><i className="fas fa-check"></i></div>
               <div>
                 <p className="mb-0 fw-bold small text-dark">Plant Watered!</p>
                 <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Just now</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white bg-opacity-50 border-top border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
        <div className="container max-w-7xl mx-auto px-4 py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bolder mb-3">Why Choose PlantPal?</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>Everything you need to keep your indoor jungle thriving, all in one beautifully designed application.</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4">
                <div className="d-inline-block p-3 rounded-circle mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: 'var(--color-primary)' }}>
                  <i className="fas fa-bell fs-3"></i>
                </div>
                <h4 className="fw-bold mb-3">Smart Reminders</h4>
                <p className="text-muted">Get precise, personalized notifications for watering, fertilizing, and repotting based on plant algorithms.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4" style={{ transform: 'translateY(-10px)' }}>
                <div className="d-inline-block p-3 rounded-circle mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: 'var(--color-secondary)' }}>
                  <i className="fas fa-camera fs-3"></i>
                </div>
                <h4 className="fw-bold mb-3">AI Identification</h4>
                <p className="text-muted">Upload a photo and let our advanced neural networks instantly identify your mysterious plant.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card h-100 text-center p-4">
                <div className="d-inline-block p-3 rounded-circle mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: 'var(--color-primary)' }}>
                  <i className="fas fa-book-open fs-3"></i>
                </div>
                <h4 className="fw-bold mb-3">Huge Knowledge Base</h4>
                <p className="text-muted">Access our extensive, scientifically-backed care guides for virtually any houseplant species.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 my-5">
        <div className="container max-w-7xl mx-auto">
          <div className="glass-container text-center p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(13,148,136,0.1))', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.3, zIndex: 0 }}></div>
            <div className="position-relative" style={{ zIndex: 1 }}>
              <h2 className="display-5 fw-bolder mb-4 text-dark">Ready to become a plant expert?</h2>
              <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>Join thousands of plant lovers who have abandoned their confusing care spreadsheets and switched to PlantPal.</p>
              <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 fs-5 shadow-lg rounded-pill hover-scale">Create Your Free Account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-4 border-top" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
        <div className="container text-center">
          <div className="d-flex justify-content-center gap-4 mb-3">
            <Link to="/privacy" className="text-muted text-decoration-none nav-link-custom">Privacy Policy</Link>
            <Link to="/terms" className="text-muted text-decoration-none nav-link-custom">Terms of Service</Link>
            <Link to="/contact" className="text-muted text-decoration-none nav-link-custom">Contact Support</Link>
          </div>
          <p className="text-muted small mb-0">&copy; 2024 PlantPal Application. Empowering plant parents globally.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
