import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MatrixRain from './MatrixRain';
import { sfxMineStart, sfxSuccess, sfxBroadcast, sfxOrphan, sfxReject } from './attackSounds';

export default function FiftyOneAttack() {
  const navigate = useNavigate();

  // Animation state
  // Phases: 0=intro, 1=both chains mining, 2=honest adds block, 3=attacker secretly mines ahead,
  //         4=attacker broadcasts longer chain, 5=network switches, 6=honest tx erased
  const [phase,         setPhase]         = useState(0);
  const [honestBlocks,  setHonestBlocks]  = useState(3);
  const [attackBlocks,  setAttackBlocks]  = useState(0);
  const [honestPct,     setHonestPct]     = useState(0);
  const [attackPct,     setAttackPct]     = useState(0);
  const [showResult,    setShowResult]    = useState(false);
  const [erasedTx,      setErasedTx]      = useState(false);
  const timers = useRef([]);
  const intervals = useRef([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current = []; intervals.current = [];
  };
  const at   = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const loop = (fn, ms) => intervals.current.push(setInterval(fn, ms));

  const mineStopRef = useRef(null);

  const runLoop = () => {
    clear();
    if (mineStopRef.current) { mineStopRef.current(); mineStopRef.current = null; }
    setPhase(0); setHonestBlocks(3); setAttackBlocks(0);
    setHonestPct(0); setAttackPct(0); setShowResult(false); setErasedTx(false);

    at(() => { setPhase(1); mineStopRef.current = sfxMineStart(); }, 1200);

    // Phase 1: both mining simultaneously — attacker faster (51%)
    let hPct = 0, aPct = 0, hBlocks = 3, aBlocks = 0;
    at(() => {
      const iv = setInterval(() => {
        hPct = Math.min(hPct + 1.8, 100);
        aPct = Math.min(aPct + 2.4, 100); // attacker 33% faster
        setHonestPct(Math.round(hPct));
        setAttackPct(Math.round(aPct));

        if (aPct >= 33 && aBlocks === 0) { aBlocks = 1; setAttackBlocks(1); sfxSuccess(); }
        if (aPct >= 66 && aBlocks === 1) { aBlocks = 2; setAttackBlocks(2); sfxSuccess(); }
        if (hPct >= 40 && hBlocks === 3) { hBlocks = 4; setHonestBlocks(4); sfxSuccess(); }
        if (hPct >= 80 && hBlocks === 4) { hBlocks = 5; setHonestBlocks(5); sfxSuccess(); }

        if (aPct >= 100 && hPct >= 70) {
          clearInterval(iv);
          if (mineStopRef.current) { mineStopRef.current(); mineStopRef.current = null; }
          setAttackPct(100); setHonestPct(Math.round(hPct));
          setAttackBlocks(3);
          at(() => { setPhase(2); }, 600);
        }
      }, 60);
      intervals.current.push(iv);
    }, 1400);

    // Phase 2: attacker broadcasts
    at(() => { setPhase(3); sfxBroadcast(); }, 6500);
    // Phase 3: network switches
    at(() => { setPhase(4); setHonestBlocks(6); sfxReject(); }, 8000);
    // Phase 4: honest tx erased
    at(() => { setPhase(5); setErasedTx(true); setShowResult(true); sfxOrphan(); }, 9500);
    // Loop
    at(() => runLoop(), 14000);
  };

  useEffect(() => { runLoop(); return clear; }, []);

  const HONEST_TXS = ['SYSTEM→USER_A', 'USER_A→USER_B', 'USER_B→USER_C', 'USER_C→USER_D', 'USER_D→USER_E'];
  const ATTACK_TXS = ['[GENESIS FORK]', 'ATTACKER→SELF', 'ATTACKER→SELF', 'ATTACKER→SELF'];

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:'monospace', position:'relative', overflow:'hidden' }}>
      <MatrixRain />
      <div style={{ position:'relative', zIndex:1, padding:'30px', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <button onClick={() => navigate(-1)} style={{ background:'black', border:'1px solid #ff6600', color:'#ff6600', padding:'8px 16px', cursor:'pointer', fontFamily:'monospace' }}>← BACK</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff6600', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 20px #ff6600' }}>⛏️ 51% ATTACK</div>
            <div style={{ color:'#ff660066', fontSize:'10px', letterSpacing:'3px', marginTop:'4px' }}>CONTROL THE MAJORITY — REWRITE HISTORY</div>
          </div>
          <div style={{ width:'80px' }} />
        </div>

        {/* Explainer */}
        <div style={{ maxWidth:'780px', margin:'0 auto 28px', background:'#080500', border:'1px solid #ff660022', borderRadius:'8px', padding:'14px 18px', color:'#555', fontSize:'11px', lineHeight:'1.9' }}>
          In Proof-of-Work the <span style={{ color:'#aaa' }}>longest chain wins</span>. If an attacker controls &gt;50% of mining power,
          they can secretly mine a <span style={{ color:'#ff6600' }}>faster fork</span>, then broadcast it to overtake the honest chain —
          erasing all honest transactions made in the meantime.
        </div>

        {/* Hash power bars */}
        <div style={{ maxWidth:'700px', margin:'0 auto 28px', display:'flex', flexDirection:'column', gap:'10px' }}>
          <PowerBar label="HONEST NETWORK" pct={49} mined={honestPct} color="#00ff00" />
          <PowerBar label="ATTACKER (51%)" pct={51} mined={attackPct} color="#ff6600" />
        </div>

        {/* Two chains */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', maxWidth:'900px', margin:'0 auto', flex:1 }}>

          {/* Honest chain */}
          <div>
            <div style={{ textAlign:'center', marginBottom:'12px' }}>
              <span style={{ color:'#00ff00', fontSize:'11px', fontWeight:'bold', letterSpacing:'2px', border:'1px solid #00ff0033', padding:'5px 14px', display:'inline-block' }}>
                HONEST CHAIN — {honestBlocks} BLOCKS
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {Array.from({ length: honestBlocks }).map((_, i) => (
                <div key={i} style={{
                  background: erasedTx && i >= 3 ? '#1a0a00' : '#001100',
                  border: `1px solid ${erasedTx && i >= 3 ? '#ff440033' : '#00ff0033'}`,
                  borderRadius:'5px', padding:'10px 12px',
                  animation: i === honestBlocks - 1 && !erasedTx ? 'newBlock 0.5s ease' : 'none',
                  opacity: erasedTx && i >= 3 ? 0.4 : 1,
                  transition:'all 0.5s',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color: erasedTx && i >= 3 ? '#ff4444' : '#00ff00', fontSize:'10px', fontWeight:'bold' }}>BLOCK #{i+1}</span>
                    {erasedTx && i >= 3 && <span style={{ color:'#ff4444', fontSize:'8px' }}>ORPHANED</span>}
                  </div>
                  <div style={{ color: erasedTx && i >= 3 ? '#443300' : '#00ff0055', fontSize:'9px', marginTop:'3px' }}>{HONEST_TXS[i] || `USER_${i}→USER_${i+1}`}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attacker chain */}
          <div>
            <div style={{ textAlign:'center', marginBottom:'12px' }}>
              <span style={{ color: phase >= 3 ? '#ff6600' : '#333', fontSize:'11px', fontWeight:'bold', letterSpacing:'2px', border:`1px solid ${phase >= 3 ? '#ff660033' : '#222'}`, padding:'5px 14px', display:'inline-block', transition:'all 0.5s' }}>
                {phase < 3 ? '🕵️ SECRET FORK (HIDDEN)' : `⚔️ ATTACKER CHAIN — ${phase >= 4 ? honestBlocks : attackBlocks + 3} BLOCKS`}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', filter: phase < 3 ? 'blur(2px)' : 'none', transition:'filter 0.8s' }}>
              {Array.from({ length: phase >= 4 ? honestBlocks : Math.max(attackBlocks + 3, 3) }).map((_, i) => (
                <div key={i} style={{
                  background: phase >= 4 ? '#0a0500' : '#050505',
                  border: `1px solid ${phase >= 4 ? '#ff6600' : '#ff660022'}`,
                  borderRadius:'5px', padding:'10px 12px',
                  animation: phase >= 3 && i >= 3 ? 'newBlock 0.5s ease' : 'none',
                  boxShadow: phase >= 4 && i >= 3 ? '0 0 10px #ff660033' : 'none',
                  transition:'all 0.5s',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color: phase >= 4 ? '#ff6600' : '#ff660055', fontSize:'10px', fontWeight:'bold' }}>BLOCK #{i+1}</span>
                    {phase >= 4 && i >= 3 && <span style={{ color:'#ff6600', fontSize:'8px', fontWeight:'bold' }}>NEW ✓</span>}
                  </div>
                  <div style={{ color: phase >= 4 ? '#ff660066' : '#222', fontSize:'9px', marginTop:'3px' }}>{ATTACK_TXS[i] || `ATTACKER→SELF`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ textAlign:'center', marginTop:'24px', minHeight:'28px' }}>
          {phase === 0 && <PL col="#00ff00" text="✓  HONEST BLOCKCHAIN RUNNING NORMALLY" />}
          {phase === 1 && <PL col="#ff6600" text="⛏️  ATTACKER SECRETLY MINING FASTER FORK (51% POWER)..." />}
          {phase === 2 && <PL col="#ff6600" text="🕵️  ATTACKER'S CHAIN NOW LONGER — PREPARING TO BROADCAST" />}
          {phase === 3 && <PL col="#ff4444" text="📡  ATTACKER BROADCASTS LONGER CHAIN TO NETWORK!" />}
          {phase === 4 && <PL col="#ff4444" text="⚡  NETWORK SWITCHES — HONEST CHAIN REPLACED" />}
          {phase >= 5  && <PL col="#ff4444" text="💀  HONEST TRANSACTIONS ERASED — DOUBLE SPEND COMPLETE" />}
        </div>

        {/* Result */}
        {showResult && (
          <div style={{ maxWidth:'580px', margin:'24px auto 0', background:'#1a0500', border:'2px solid #ff6600', borderRadius:'10px', padding:'20px 28px', textAlign:'center', animation:'fadeInScale 0.4s ease', boxShadow:'0 0 40px #ff660033' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>⚠️</div>
            <div style={{ color:'#ff6600', fontSize:'15px', fontWeight:'bold', letterSpacing:'3px', marginBottom:'8px' }}>CHAIN REWRITTEN</div>
            <div style={{ color:'#555', fontSize:'10px', lineHeight:'1.9' }}>
              The attacker's longer chain was accepted by the network.
              Transactions in the replaced blocks are <span style={{ color:'#ff4444' }}>erased from history</span>.
              Real blockchains defend this by requiring <span style={{ color:'#ff6600' }}>6+ confirmations</span> before accepting a payment as final.
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes newBlock { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

function PowerBar({ label, pct, mined, color }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
        <span style={{ color, fontSize:'10px', letterSpacing:'1px' }}>{label}</span>
        <span style={{ color, fontSize:'10px', fontWeight:'bold' }}>{pct}% hash power</span>
      </div>
      <div style={{ height:'12px', background:'#0a0a0a', borderRadius:'6px', overflow:'hidden', border:`1px solid ${color}33` }}>
        <div style={{ height:'100%', width:`${mined}%`, background:`linear-gradient(90deg,${color}66,${color})`, transition:'width 0.08s', boxShadow:`0 0 8px ${color}` }} />
      </div>
    </div>
  );
}
function PL({ col, text }) {
  return <div style={{ color:col, fontSize:'12px', letterSpacing:'2px', fontWeight:'bold', textShadow:`0 0 12px ${col}` }}>{text}</div>;
}
