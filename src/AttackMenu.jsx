import React from 'react';
import { useNavigate } from 'react-router-dom';

const ATTACKS = [
  { id:'tamper',      icon:'✏️', name:'TAMPER ATTACK',  color:'#ff0000', desc:'Edit one block — watch the entire chain collapse in real time.' },
  { id:'fifty-one',   icon:'⛏️', name:'51% ATTACK',     color:'#ff6600', desc:'Control majority hash power, mine a secret fork, rewrite history.' },
  { id:'replay',      icon:'🔁', name:'REPLAY ATTACK',  color:'#ffff00', desc:'Steal a signed transaction and try to reuse it on another block.' },
  { id:'sybil',       icon:'👥', name:'SYBIL ATTACK',   color:'#d800ff', desc:'Flood the POS validator pool with fake identities to rig the lottery.' },
  { id:'doublespend', icon:'💸', name:'DOUBLE SPEND',   color:'#00ffff', desc:'Spend the same coins twice — network forks and resolves the conflict.' },
];

export default function AttackMenu({ blocks, onClose }) {
  const navigate = useNavigate();

  const launch = (id) => {
    const copy = JSON.parse(JSON.stringify(blocks));
    navigate(`/attack/${id}`, { state: { blocks: copy } });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:100000, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#050005', border:'2px solid #ff0000', boxShadow:'0 0 60px #ff000033', borderRadius:'12px', padding:'32px 36px', width:'540px', fontFamily:'monospace', animation:'fadeInScale 0.2s ease' }}
      >
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ color:'#ff0000', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 15px #ff0000' }}>⚔️ ATTACK SIMULATOR</div>
          <div style={{ color:'#ff000055', fontSize:'10px', letterSpacing:'2px', marginTop:'6px' }}>SELECT AN ATTACK — ANIMATED VISUALIZATION WILL PLAY</div>
          <div style={{ color:'#333', fontSize:'9px', marginTop:'4px' }}>✓ Your original blockchain is untouched</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {ATTACKS.map(atk => (
            <button
              key={atk.id}
              onClick={() => launch(atk.id)}
              style={{ background:'black', border:`1px solid ${atk.color}33`, borderRadius:'6px', padding:'14px 16px', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'14px', transition:'all 0.2s', fontFamily:'monospace' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${atk.color}11`; e.currentTarget.style.border = `1px solid ${atk.color}`; e.currentTarget.style.boxShadow = `0 0 15px ${atk.color}33`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'black'; e.currentTarget.style.border = `1px solid ${atk.color}33`; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize:'22px', flexShrink:0 }}>{atk.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:atk.color, fontSize:'12px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'3px' }}>{atk.name}</div>
                <div style={{ color:'#444', fontSize:'10px', lineHeight:'1.5' }}>{atk.desc}</div>
              </div>
              <span style={{ color:atk.color, fontSize:'18px', flexShrink:0 }}>›</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{ marginTop:'20px', width:'100%', padding:'10px', background:'black', border:'1px solid #222', color:'#444', fontFamily:'monospace', cursor:'pointer', borderRadius:'4px', fontSize:'11px' }}
        >
          ✕ CANCEL
        </button>
      </div>
      <style>{`@keyframes fadeInScale { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}