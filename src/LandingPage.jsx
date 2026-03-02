import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatrixRain from './MatrixRain'; 

const LandingPage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  
  // --- NEW: GET USER IDENTITY ---
  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // ... (Your images and styles stay the same) ...
  const leftBgImage = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
  const rightBgImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop";

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'black',
    fontFamily: "'Courier New', monospace",
    overflow: 'hidden',
    position: 'relative'
  };

  const sectionStyle = (side) => ({
    flex: hovered === side ? 2 : (hovered ? 0.5 : 1),
    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    borderRight: side === 'left' ? '1px solid rgba(0, 255, 0, 0.2)' : 'none',
    overflow: 'hidden'
  });

  const bgLayerStyle = (imgUrl) => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${imgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.4,
    filter: 'grayscale(100%) contrast(120%)',
    transition: 'all 0.6s ease',
    zIndex: 0
  });

  return (
    <div style={containerStyle}>
      
      {/* --- NEW: USER SESSION OVERLAY --- */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '15px',
        background: 'rgba(0,0,0,0.7)', padding: '10px 20px', border: '1px solid #00ff00'
      }}>
        <span style={{color: '#00ff00', fontSize: '12px'}}>
          ACTIVE_SESSION: {userEmail}
        </span>
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent', border: '1px solid #ff4444', color: '#ff4444',
            padding: '5px 10px', cursor: 'pointer', fontSize: '10px', fontFamily: 'monospace'
          }}
        >
          [ TERMINATE ]
        </button>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: 0.15, zIndex: 5, pointerEvents: 'none'}}>
         <MatrixRain />
      </div>

      {/* LEFT SIDE: SIMULATOR */}
      <div 
        style={sectionStyle('left')}
        onMouseEnter={() => setHovered('left')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/simulate')}
      >
        <div style={{
            ...bgLayerStyle(leftBgImage),
            transform: hovered === 'left' ? 'scale(1.1)' : 'scale(1)',
            filter: hovered === 'left' ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.5)'
        }} />

        <div style={{zIndex: 10, textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)'}}>
            <h1 style={{fontSize: '3.5rem', color: '#00ff00', textShadow: '0 0 20px rgba(0, 255, 0, 0.8)', margin: 0, letterSpacing: '-2px'}}>
                ENTER THE LEDGER
            </h1>
            <p style={{color: '#fff', letterSpacing: '3px', marginTop: '10px', fontSize: '14px', borderTop: '1px solid #00ff00', paddingTop: '10px', display: 'inline-block'}}>
                // DIVE_INTO_THE_CHAIN
            </p>
            <div style={{marginTop: '40px', height: '20px', opacity: hovered === 'left' ? 1 : 0, transition: 'opacity 0.3s', color: '#00ff00', fontSize: '12px'}}>
                [ CLICK TO INITIALIZE NODE ]
            </div>
        </div>
      </div>

      {/* RIGHT SIDE: INFO */}
      <div 
        style={sectionStyle('right')}
        onMouseEnter={() => setHovered('right')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/info')}
      >
        <div style={{
            ...bgLayerStyle(rightBgImage),
            transform: hovered === 'right' ? 'scale(1.1)' : 'scale(1)',
            filter: hovered === 'right' ? 'grayscale(0%)' : 'grayscale(100%) brightness(0.5)'
        }} />

        <div style={{zIndex: 10, textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)'}}>
            <h1 style={{fontSize: '3.5rem', color: '#fff', fontStyle: 'italic', fontFamily: 'serif', textShadow: '0 0 20px rgba(255, 255, 255, 0.5)', margin: 0}}>
                DECRYPT THE LOGIC
            </h1>
            <p style={{color: '#ccc', letterSpacing: '2px', marginTop: '10px', fontFamily: 'sans-serif', fontSize: '12px', borderTop: '1px solid #fff', paddingTop: '10px', display: 'inline-block'}}>
                // ACCESS_KNOWLEDGE_BASE
            </p>
             <div style={{marginTop: '40px', height: '20px', opacity: hovered === 'right' ? 1 : 0, transition: 'opacity 0.3s', color: '#fff', fontSize: '12px'}}>
                [ OPEN ARCHIVES ]
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
