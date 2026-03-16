import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import sha256 from 'crypto-js/sha256';
import MatrixRain from './MatrixRain';
import { sfxAlert, sfxType, sfxBreak, sfxReject } from './attackSounds';

const GENESIS_HASH = '00ae5fb007821c281ab4d80f8562d801884378650176909c413a2c398c8e6e01';

function hashBlock(b, prevHash) {
  if (b.index === 1) return GENESIS_HASH;
  const tx = JSON.stringify({ sender: b.sender, receiver: b.receiver, amount: Number(b.amount) });
  return sha256(b.index + prevHash + tx + (b.nonce || 0)).toString();
}

export default function TamperAttack() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const rawBlocks = state?.blocks?.slice(0, 4) || [];
  const fallback = [
    { index:1, hash:GENESIS_HASH, previousHash:'0', nonce:200, sender:'SYSTEM', receiver:'USER_A', amount:10 },
    { index:2, hash:'', previousHash:'', nonce:312, sender:'USER_A', receiver:'USER_B', amount:20 },
    { index:3, hash:'', previousHash:'', nonce:441, sender:'USER_B', receiver:'USER_C', amount:30 },
    { index:4, hash:'', previousHash:'', nonce:178, sender:'USER_C', receiver:'USER_D', amount:40 },
  ];

  const buildChain = (blocks) => {
    const c = JSON.parse(JSON.stringify(blocks.length >= 4 ? blocks.slice(0,4) : fallback));
    for (let i = 0; i < c.length; i++) {
      c[i].previousHash = i === 0 ? '0' : c[i-1].hash;
      c[i].hash = hashBlock(c[i], c[i].previousHash);
    }
    return c;
  };

  const honest = buildChain(rawBlocks.length >= 2 ? rawBlocks : fallback);
  const TAMPERED_AMOUNT = 9999;

  const [phase,       setPhase]       = useState(0);
  const [typingText,  setTypingText]  = useState(String(honest[1]?.amount || 20));
  const [showBanner,  setShowBanner]  = useState(false);
  const timers = useRef([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const runLoop = () => {
    clear();
    setPhase(0); setShowBanner(false); setTypingText(String(honest[1]?.amount || 20));

    at(() => setPhase(1), 1500);
    at(() => { setPhase(2); sfxAlert(); }, 2800);

    const orig   = String(honest[1]?.amount || 20);
    const target = String(TAMPERED_AMOUNT);
    // erase original
    [...orig].forEach((_, i) => {
      at(() => { setTypingText(orig.slice(0, orig.length - 1 - i) || ''); sfxType(); }, 3200 + i * 120);
    });
    // type new value
    [...target].forEach((_, i) => {
      at(() => { setTypingText(target.slice(0, i + 1)); sfxType(); }, 3200 + orig.length * 120 + 200 + i * 150);
    });

    const done = 3200 + orig.length * 120 + target.length * 150 + 400;
    at(() => { setPhase(3); sfxBreak(); }, done);
    at(() => { setPhase(4); sfxBreak(); }, done + 900);
    at(() => { setPhase(5); sfxBreak(); }, done + 1800);
    at(() => { setPhase(6); setShowBanner(true); sfxReject(); }, done + 2600);
    at(() => runLoop(), done + 6000);
  };

  useEffect(() => { runLoop(); return clear; }, []);

  const tamperedHash = (() => {
    const tx = JSON.stringify({ sender: honest[1]?.sender, receiver: honest[1]?.receiver, amount: TAMPERED_AMOUNT });
    return sha256(2 + honest[0].hash + tx + (honest[1]?.nonce || 0)).toString();
  })();

  const blockColor = (idx) => {
    if (idx === 1 && phase >= 3) return '#ff0000';
    if ((idx === 2 && phase >= 4) || (idx === 3 && phase >= 5)) return '#ff0000';
    if (idx === 1 && phase >= 1) return '#ffff00';
    return '#00ff00';
  };

  const blockBg = (idx) => {
    if (idx === 1 && phase >= 3) return { bg: '#1a0000', border: '2px solid #ff0000', shadow: '0 0 25px #ff000066' };
    if ((idx === 2 && phase >= 4) || (idx === 3 && phase >= 5)) return { bg: '#1a0000', border: '2px solid #ff0000', shadow: '0 0 25px #ff000066' };
    if (idx === 1 && phase >= 1) return { bg: '#1a1a00', border: '2px solid #ffff00', shadow: '0 0 25px #ffff0066' };
    return { bg: '#001100', border: '1px solid #00ff0055', shadow: 'none' };
  };

  const arrowBroken = (idx) => (idx === 1 && phase >= 4) || (idx === 2 && phase >= 5);

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:'monospace', position:'relative', overflow:'hidden' }}>
      <MatrixRain />
      <div style={{ position:'relative', zIndex:1, padding:'30px', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
          <button onClick={() => navigate(-1)} style={{ background:'black', border:'1px solid #ff0000', color:'#ff0000', padding:'8px 16px', cursor:'pointer', fontFamily:'monospace' }}>← BACK</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ff0000', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 20px #ff0000' }}>✏️ TAMPER ATTACK</div>
            <div style={{ color:'#ff000066', fontSize:'10px', letterSpacing:'3px', marginTop:'4px' }}>CHANGE ONE BLOCK — THE ENTIRE CHAIN COLLAPSES</div>
          </div>
          <div style={{ width:'80px' }} />
        </div>

        {/* Explainer */}
        <div style={{ maxWidth:'780px', margin:'0 auto 32px', background:'#080000', border:'1px solid #ff000022', borderRadius:'8px', padding:'14px 18px', color:'#555', fontSize:'11px', lineHeight:'1.9' }}>
          Each block's hash is built from its <span style={{ color:'#aaa' }}>own data</span> + the <span style={{ color:'#ff4444' }}>previous block's hash</span>.
          Changing any value breaks the link to every downstream block.
          To fix it, the attacker must re-mine <span style={{ color:'#ff4444' }}>all subsequent blocks</span> faster than the entire honest network — practically impossible.
        </div>

        {/* Chain */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0', margin:'0 auto', overflowX:'auto', padding:'10px 0', maxWidth:'100%' }}>
          {honest.map((block, idx) => {
            const s      = blockBg(idx);
            const col    = blockColor(idx);
            const isTgt  = idx === 1;
            const broken = (idx === 2 && phase >= 4) || (idx === 3 && phase >= 5);
            const dispAmt = isTgt && phase >= 2 ? typingText : block.amount;
            const dispHash = isTgt && phase >= 3 ? tamperedHash : block.hash;

            return (
              <React.Fragment key={idx}>
                <div style={{ background: s.bg, border: s.border, boxShadow: s.shadow, borderRadius:'10px', padding:'16px 14px', width:'195px', flexShrink:0, transition:'all 0.5s ease', position:'relative' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px', borderBottom:`1px solid ${col}33`, paddingBottom:'6px' }}>
                    <span style={{ color: col, fontSize:'11px', fontWeight:'bold', letterSpacing:'2px' }}>BLOCK #{block.index}</span>
                    {isTgt && phase >= 3 && <span style={{ color:'#ff0000', fontSize:'8px', fontWeight:'bold', letterSpacing:'1px', animation:'blink 0.8s infinite' }}>TAMPERED</span>}
                    {broken            && <span style={{ color:'#ff0000', fontSize:'8px', fontWeight:'bold', letterSpacing:'1px' }}>BROKEN</span>}
                  </div>

                  <Row label="FROM"  val={block.sender}   col={col} />
                  <Row label="TO"    val={block.receiver} col={col} />
                  <Row
                    label="AMT"
                    val={String(dispAmt) + (isTgt && phase === 2 ? '▌' : '')}
                    col={isTgt && phase >= 2 ? '#ffff00' : col}
                  />
                  <Row label="PREV"  val={block.previousHash?.substring(0,8)+'…'} col={broken ? '#ff000088' : '#00ff0033'} />
                  <Row label="HASH"  val={dispHash?.substring(0,10)+'…'}           col={col} />

                  {broken && (
                    <div style={{ marginTop:'8px', color:'#ff0000', fontSize:'8px', textAlign:'center', letterSpacing:'1px', padding:'4px', background:'#2a0000', borderRadius:'3px' }}>
                      PREV HASH MISMATCH
                    </div>
                  )}
                </div>

                {idx < honest.length - 1 && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'32px', flexShrink:0 }}>
                    <div style={{ color: arrowBroken(idx) ? '#ff0000' : '#00ff0055', fontSize:'22px', transition:'color 0.5s', lineHeight:'1' }}>→</div>
                    {arrowBroken(idx) && <div style={{ color:'#ff0000', fontSize:'10px', marginTop:'2px', animation:'blink 0.6s infinite' }}>✕</div>}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Phase label */}
        <div style={{ textAlign:'center', marginTop:'28px', minHeight:'28px' }}>
          {phase === 0 && <PL col="#00ff00" text="✓  VALID BLOCKCHAIN — ALL HASHES CORRECTLY LINKED" />}
          {phase === 1 && <PL col="#ffff00" text="🎯  ATTACKER TARGETS BLOCK #2 TO MODIFY..." />}
          {phase === 2 && <PL col="#ffff00" text={`✏️  CHANGING AMOUNT: ${honest[1]?.amount} → ${typingText}▌`} />}
          {phase === 3 && <PL col="#ff4444" text="⚡  BLOCK #2 HASH CHANGED — DOWNSTREAM CHAIN LINK BROKEN" />}
          {phase === 4 && <PL col="#ff4444" text="⚡  BLOCK #3 NOW INVALID — PREVIOUS HASH MISMATCH" />}
          {phase >= 5  && <PL col="#ff4444" text="⚡  ENTIRE CHAIN CORRUPTED — ALL BLOCKS AFTER #2 BROKEN" />}
        </div>

        {/* Rejection banner */}
        {showBanner && (
          <div style={{ maxWidth:'580px', margin:'28px auto 0', background:'#1a0000', border:'2px solid #ff0000', borderRadius:'10px', padding:'22px 28px', textAlign:'center', animation:'fadeInScale 0.4s ease', boxShadow:'0 0 50px #ff000033' }}>
            <div style={{ fontSize:'36px', marginBottom:'10px' }}>🛡️</div>
            <div style={{ color:'#ff0000', fontSize:'16px', fontWeight:'bold', letterSpacing:'3px', marginBottom:'10px' }}>NETWORK REJECTS THIS CHAIN</div>
            <div style={{ color:'#555', fontSize:'10px', lineHeight:'1.9' }}>
              Every honest node recomputes and verifies hashes independently.
              The tampered chain fails verification and is <span style={{ color:'#ff4444' }}>immediately discarded</span>.
              The attacker would need to re-mine every subsequent block AND outpace the entire network — practically impossible.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

function Row({ label, val, col }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #0d0d0d', padding:'3px 0', fontSize:'9px' }}>
      <span style={{ color:'#333' }}>{label}</span>
      <span style={{ color:col, fontFamily:'monospace', transition:'color 0.4s' }}>{val}</span>
    </div>
  );
}
function PL({ col, text }) {
  return <div style={{ color:col, fontSize:'12px', letterSpacing:'2px', fontWeight:'bold', textShadow:`0 0 12px ${col}` }}>{text}</div>;
}