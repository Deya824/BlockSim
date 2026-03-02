import React, { useState } from 'react';
import sha256 from 'crypto-js/sha256';

function KeyVault({ onClose, onWalletGenerated, wallet }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  const playBeep = (freq = 440, type = 'sine') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const generateWallet = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const entropy = Math.random().toString(36) + Date.now() + Math.random().toString(36);
      const privateKey = sha256(entropy + "__PRIVATE__").toString();
      const publicKey  = sha256(privateKey + "__PUBLIC__").toString();
      onWalletGenerated({ privateKey, publicKey });
      setIsGenerating(false);
      playBeep(600, 'sine');
    }, 1200);
  };

  const cyan   = '#00ffff';
  const neon   = '#00ff00';
  const orange = '#ff6600';

  const keyBoxStyle = {
    background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '3px',
    padding: '8px 10px', fontSize: '9px', wordBreak: 'break-all',
    lineHeight: '1.6', marginTop: '5px', fontFamily: 'monospace',
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '360px',
        background: '#000', borderLeft: `1px solid ${cyan}`,
        boxShadow: `-4px 0 30px ${cyan}33`, zIndex: 1000,
        display: 'flex', flexDirection: 'column', fontFamily: 'monospace',
        animation: 'slideInRight 0.2s ease', overflowY: 'auto',
      }}>

        {/* HEADER */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${cyan}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#000', zIndex: 10 }}>
          <div>
            <div style={{ color: cyan, fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}>🔐 MY_WALLET</div>
            <div style={{ color: '#444', fontSize: '10px', marginTop: '2px' }}>Your blockchain identity</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #ff0000', color: '#ff0000', padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>

          {/* EXPLAINER */}
          <div style={{ background: '#050505', border: `1px solid ${cyan}22`, borderRadius: '4px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ color: cyan, fontSize: '10px', letterSpacing: '1px', marginBottom: '8px', opacity: 0.7 }}>WHAT IS THIS?</div>
            <div style={{ color: '#555', fontSize: '10px', lineHeight: '1.8' }}>
              In real blockchains like <span style={{ color: neon }}>Bitcoin</span> or <span style={{ color: '#d800ff' }}>Ethereum</span>, every user has a <span style={{ color: orange }}>wallet</span> — a private/public key pair. You <span style={{ color: orange }}>sign</span> every transaction with your private key before the network accepts it. This proves <em style={{ color: '#aaa' }}>you</em> authorized it.
            </div>
          </div>

          {!wallet ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔑</div>
              <div style={{ color: '#555', fontSize: '11px', marginBottom: '20px', lineHeight: '1.8' }}>
                You don't have a wallet yet.<br />Generate one to start signing transactions.
              </div>
              <button
                onClick={generateWallet}
                disabled={isGenerating}
                style={{ padding: '12px 24px', background: isGenerating ? '#111' : cyan, border: `1px solid ${cyan}`, color: isGenerating ? '#333' : 'black', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px', cursor: isGenerating ? 'not-allowed' : 'pointer', letterSpacing: '1px', borderRadius: '3px', width: '100%' }}
              >
                {isGenerating ? '⟳ GENERATING WALLET...' : '⚡ GENERATE MY WALLET'}
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: '#001a00', border: `1px solid ${neon}44`, borderRadius: '4px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ color: neon, fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>✅ WALLET ACTIVE</div>
                <div style={{ color: '#555', fontSize: '10px' }}>You can now sign transactions when adding blocks.</div>
              </div>

              {/* PUBLIC KEY */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ color: neon, fontSize: '10px', letterSpacing: '1px', marginBottom: '4px' }}>
                  🔓 PUBLIC KEY <span style={{ color: '#444' }}>(shareable — used to verify)</span>
                </div>
                <div style={keyBoxStyle}>
                  <span style={{ color: neon }}>{wallet.publicKey.substring(0, 20)}</span>
                  <span style={{ color: '#333' }}>{wallet.publicKey.substring(20)}</span>
                </div>
              </div>

              {/* PRIVATE KEY */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ color: orange, fontSize: '10px', letterSpacing: '1px' }}>
                    🔑 PRIVATE KEY <span style={{ color: '#444' }}>(never share!)</span>
                  </div>
                  <button onClick={() => setShowPrivate(p => !p)} style={{ background: 'none', border: '1px solid #333', color: '#555', fontSize: '9px', padding: '2px 8px', cursor: 'pointer', fontFamily: 'monospace' }}>
                    {showPrivate ? 'HIDE' : 'REVEAL'}
                  </button>
                </div>
                <div style={keyBoxStyle}>
                  {showPrivate
                    ? <><span style={{ color: orange }}>{wallet.privateKey.substring(0, 20)}</span><span style={{ color: '#444' }}>{wallet.privateKey.substring(20)}</span></>
                    : <span style={{ color: '#333' }}>{'•'.repeat(64)}</span>}
                </div>
              </div>

              {/* HOW SIGNING WORKS */}
              <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ color: '#555', fontSize: '10px', letterSpacing: '1px', marginBottom: '10px' }}>HOW SIGNING WORKS</div>
                {[
                  { icon: '📝', label: 'Transaction data (from, to, amount)', color: '#aaa' },
                  { icon: '⬇️', label: 'SHA-256 hash of the data',            color: '#555' },
                  { icon: '🔑', label: 'Encrypt hash with private key',        color: orange },
                  { icon: '✍️', label: '= SIGNATURE (attached to block)',      color: neon   },
                  { icon: '🔓', label: 'Anyone verifies with your public key', color: cyan   },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px' }}>{s.icon}</span>
                    <span style={{ color: s.color, fontSize: '10px' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <button onClick={generateWallet} disabled={isGenerating} style={{ width: '100%', padding: '8px', background: 'black', border: '1px solid #333', color: '#444', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer' }}>
                ↺ REGENERATE WALLET (new identity)
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default KeyVault;
