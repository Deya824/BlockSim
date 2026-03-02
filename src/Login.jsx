import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("ESTABLISHING SECURE LINK...");

    // Matches the routes we defined in server.js
    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      // Using 127.0.0.1:5000 to prevent 'localhost' DNS resolution errors
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegistering) {
          setStatus("REGISTRATION SUCCESSFUL. ACCESS GRANTED.");
          // Switch to login mode automatically after successful registration
          setIsRegistering(false); 
          setPassword(""); 
        } else {
          // Store session data locally to pass the ProtectedRoute check
          localStorage.setItem("authToken", "AUTHORIZED_V1");
          localStorage.setItem("userEmail", email); 
          navigate('/'); 
        }
      } else {
        // Displays the specific error message from your Backend (e.g., 'Invalid credentials')
        setStatus(`ACCESS DENIED: ${data.message || "Authentication Failed"}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("NODE SERVER UNREACHABLE. START SERVER.JS.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundImage: 'url("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: "'Courier New', monospace"
    }}>
      {/* Dark Overlay for UI Readability */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1 }}></div>

      <div style={{
        zIndex: 10, border: '2px solid #00ff00', padding: '40px', 
        background: 'rgba(10, 10, 10, 0.9)', boxShadow: '0 0 30px rgba(0,255,0,0.3)',
        width: '400px', textAlign: 'center', borderRadius: '8px'
      }}>
        <h1 style={{ color: '#00ff00', fontSize: '22px', marginBottom: '20px', letterSpacing: '2px' }}>
          {isRegistering ? "CREATE_NEW_ID" : "AUTH_CHECKPOINT"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" placeholder="USER@DOMAIN.COM" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#00ff00', outline: 'none' }}
          />
          <input 
            type="password" placeholder="PASSWORD" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#00ff00', outline: 'none' }}
          />

          <button type="submit" disabled={loading} style={{
             padding: '12px', background: '#00ff00', color: 'black', fontWeight: 'bold', 
             cursor: 'pointer', border: 'none', transition: '0.3s'
          }}>
            {loading ? "PROCESSING..." : (isRegistering ? "ENCRYPT & REGISTER" : "ENTER MAINFRAME")}
          </button>
        </form>

        {/* Status Message Display */}
        <p style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            color: status.includes('SUCCESS') ? '#00ff00' : '#ff4444',
            minHeight: '1.2em' 
        }}>
            {status}
        </p>
        
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setStatus(""); }}
          style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px' }}
        >
          {isRegistering ? "HAVE CREDENTIALS? LOGIN" : "NO ACCOUNT DETECTED? REGISTER"}
        </button>
      </div>
    </div>
  );
};

export default Login;
