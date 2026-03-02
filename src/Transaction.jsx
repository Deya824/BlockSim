import React from 'react';

function Transaction({ sender, setSender, receiver, setReceiver, amount, setAmount, consensus }) {
  const neonGreen = '#00ff00';
  const neonPurple = '#d800ff';
  const accentColor = consensus === 'POS' ? neonPurple : neonGreen;

  const inputStyle = {
    width: '75px',
    fontSize: '11px',
    textAlign: 'center',
    background: 'black',
    border: `1px solid ${accentColor}`,
    borderRadius: '3px',
    color: accentColor,
    padding: '3px 4px',
    fontFamily: 'monospace',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '9px',
    color: accentColor,
    fontFamily: 'monospace',
    letterSpacing: '1px',
    marginBottom: '3px',
    opacity: 0.7,
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: `1px solid ${accentColor}`,
      borderRadius: '4px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: `0 0 8px ${accentColor}33`,
    }}>

      {/* FROM → TO ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        
        {/* FROM */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={labelStyle}>FROM</div>
          <div style={{ fontSize: '16px', marginBottom: '3px' }}>👤</div>
          <input
            value={sender}
            onChange={e => setSender(e.target.value)}
            style={inputStyle}
            placeholder="SENDER"
          />
        </div>

        {/* ARROW */}
        <div style={{ color: accentColor, fontSize: '18px', marginTop: '18px', textShadow: `0 0 6px ${accentColor}` }}>➔</div>

        {/* TO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={labelStyle}>TO</div>
          <div style={{ fontSize: '16px', marginBottom: '3px' }}>🏦</div>
          <input
            value={receiver}
            onChange={e => setReceiver(e.target.value)}
            style={inputStyle}
            placeholder="RECEIVER"
          />
        </div>
      </div>

      {/* AMOUNT ROW */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={labelStyle}>AMOUNT</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: neonGreen, fontWeight: 'bold', fontSize: '14px', fontFamily: 'monospace' }}>₿</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ ...inputStyle, width: '90px', color: neonGreen, borderColor: neonGreen, fontWeight: 'bold' }}
          />
        </div>
      </div>



    </div>
  );
}

export default Transaction;
