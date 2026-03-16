import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatrixRain from './MatrixRain';

const LandingPage = () => {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(null);

  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const leftBgImage  = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop";
  const rightBgImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop";

  const sectionStyle = (side) => ({
    flex: hovered === side ? 2 : (hovered ? 0.5 : 1),
    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
  });

  const bgLayerStyle = (imgUrl, side) => ({
    position: 'absolute', inset: 0,
    backgroundImage: `url(${imgUrl})`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    opacity: hovered === side ? 0.85 : 0.65,
    filter: hovered === side
      ? 'grayscale(0%) brightness(0.75)'
      : 'grayscale(40%) brightness(0.55)',
    transform: hovered === side ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.6s ease', zIndex: 0,
  });

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      backgroundColor: '#000', fontFamily: "'Courier New', monospace",
      overflow: 'hidden', position: 'relative',
    }}>

      {/* Matrix Rain */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, zIndex: 5, pointerEvents: 'none' }}>
        <MatrixRain />
      </div>

      {/* TOP BAR */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(0,255,0,0.1)',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '7px', height: '7px', background: '#00ff00', borderRadius: '50%', boxShadow: '0 0 8px #00ff00' }} />
          <span style={{ color: '#00ff00', fontSize: '11px', letterSpacing: '4px' }}>BLOCKCHAIN_CORE</span>
          <span style={{ color: '#333', fontSize: '10px', marginLeft: '4px' }}>v3.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#00ff0055', fontSize: '10px', letterSpacing: '1px' }}>
            ACTIVE_SESSION: {userEmail}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid rgba(255,68,68,0.5)',
              color: '#ff4444', padding: '6px 14px', cursor: 'pointer',
              fontSize: '10px', letterSpacing: '2px', fontFamily: "'Courier New', monospace",
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* LEFT — Simulator */}
      <div
        style={{ ...sectionStyle('left'), borderRight: '1px solid rgba(0,255,0,0.15)' }}
        onMouseEnter={() => setHovered('left')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/simulate')}
      >
        <div style={bgLayerStyle(leftBgImage, 'left')} />

        <div style={{ zIndex: 10, textAlign: 'center', padding: '40px 52px', maxWidth: '500px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', borderRadius: '4px' }}>

          <p style={{ color: 'rgba(0,255,0,0.5)', fontSize: '10px', letterSpacing: '4px', marginBottom: '18px' }}>
            ⛓ BLOCKCHAIN SIMULATOR
          </p>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
            color: '#00ff00',
            fontFamily: "'Courier New', monospace",
            fontWeight: 'bold',
            margin: '0 0 14px',
            lineHeight: 1.05,
            letterSpacing: '-1px',
            textShadow: '0 0 20px rgba(0,255,0,0.4)',
          }}>
            ENTER<br />THE LEDGER
          </h1>

          <p style={{ color: '#444', fontSize: '11px', letterSpacing: '3px', marginBottom: '22px' }}>
            // MINE · STAKE · TAMPER · VERIFY
          </p>

          <p style={{
            color: '#999',
            fontSize: '15px',
            lineHeight: '1.85',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            marginBottom: '28px',
          }}>
            Build and break a real blockchain. Mine blocks with Proof of Work, stake ETH with Proof of Stake, tamper with transactions and watch the entire chain collapse in real time.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {['POW MINING', 'POS STAKING', 'TAMPER DETECTION', 'ATTACK SIM', 'CHAIN CASCADE'].map(f => (
              <span key={f} style={{
                fontSize: '9px', letterSpacing: '2px', padding: '4px 10px',
                border: '1px solid rgba(0,255,0,0.25)', color: 'rgba(0,255,0,0.5)',
                fontFamily: "'Courier New', monospace",
              }}>{f}</span>
            ))}
          </div>

          <div style={{
            display: 'inline-block',
            padding: '12px 30px',
            border: '1px solid #00ff00',
            color: '#00ff00',
            fontSize: '12px',
            letterSpacing: '3px',
            fontFamily: "'Courier New', monospace",
          }}>
            ▶ INITIALIZE NODE
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '18px', left: '22px', zIndex: 10, color: 'rgba(0,255,0,0.2)', fontSize: '9px', letterSpacing: '2px' }}>
          NODE ACTIVE
        </div>
      </div>

      {/* RIGHT — Info */}
      <div
        style={sectionStyle('right')}
        onMouseEnter={() => setHovered('right')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/info')}
      >
        <div style={bgLayerStyle(rightBgImage, 'right')} />

        <div style={{ zIndex: 10, textAlign: 'center', padding: '40px 52px', maxWidth: '500px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', borderRadius: '4px' }}>

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '4px', marginBottom: '18px' }}>
            📖 TECHNICAL REFERENCE
          </p>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
            color: '#fff',
            fontFamily: "'Georgia', serif",
            fontStyle: 'italic',
            fontWeight: 'bold',
            margin: '0 0 14px',
            lineHeight: 1.05,
            textShadow: '0 0 20px rgba(255,255,255,0.15)',
          }}>
            DECRYPT<br />THE LOGIC
          </h1>

          <p style={{ color: '#444', fontSize: '11px', letterSpacing: '3px', marginBottom: '22px' }}>
            // ARCHITECTURE · CRYPTO · CONSENSUS
          </p>

          <p style={{
            color: '#999',
            fontSize: '15px',
            lineHeight: '1.85',
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            marginBottom: '28px',
          }}>
            A complete technical breakdown of how blockchains actually work — cryptographic hashing, wallets, consensus mechanisms, attack vectors, Merkle trees, and real-world applications.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {['HASHING', 'WALLETS', 'POW vs POS', 'ATTACK VECTORS', 'MERKLE TREE'].map(f => (
              <span key={f} style={{
                fontSize: '9px', letterSpacing: '2px', padding: '4px 10px',
                border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.35)',
                fontFamily: "'Courier New', monospace",
              }}>{f}</span>
            ))}
          </div>

          <div style={{
            display: 'inline-block',
            padding: '12px 30px',
            border: '1px solid rgba(255,255,255,0.6)',
            color: '#fff',
            fontSize: '12px',
            letterSpacing: '3px',
            fontFamily: "'Courier New', monospace",
          }}>
            ◉ OPEN ARCHIVES
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '18px', right: '22px', zIndex: 10, color: 'rgba(255,255,255,0.15)', fontSize: '9px', letterSpacing: '2px' }}>
          7 SECTIONS · FULLY INDEXED
        </div>
      </div>

    </div>
  );
};

export default LandingPage;