import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import sha256 from 'crypto-js/sha256';
import MatrixRain from './MatrixRain';
import { sfxPacket, sfxIntercept, sfxAlert, sfxReject, sfxSuccess } from './attackSounds';

export default function ReplayAttack() {
  const navigate = useNavigate();

  const [phase,          setPhase]          = useState(0);
  const [packetPos,      setPacketPos]       = useState(0);
  const [replayPos,      setReplayPos]       = useState(0);
  const [showStolenSig,  setShowStolenSig]  = useState(false);
  const [showVerify,     setShowVerify]     = useState(false);
  const [rejected,       setRejected]       = useState(false);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(t => clearTimeout(t.id || t)); timers.current = []; };
  const at = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  const TX       = { sender:'USER_A', receiver:'USER_B', amount:50 };
  const TX3      = { sender:'USER_B', receiver:'USER_C', amount:80 };
  const origHash = sha256(JSON.stringify(TX)).toString();
  const tx3Hash  = sha256(JSON.stringify(TX3)).toString();
  const sig      = sha256(origHash + 'PRIVATE_KEY').toString();

  const runLoop = () => {
    clear();
    setPhase(0); setPacketPos(0); setReplayPos(0);
    setShowStolenSig(false); setShowVerify(false); setRejected(false);

    // phase 1 — packet travels from block2 toward network
    at(() => { setPhase(1); sfxPacket(); }, 1000);
    let pp = 0;
    const iv1 = setInterval(() => {
      pp = Math.min(pp + 4, 100);
      setPacketPos(pp);
      if (pp >= 100) clearInterval(iv1);
    }, 30);

    // phase 2 — attacker intercepts
    at(() => { setPhase(2); setShowStolenSig(true); sfxIntercept(); }, 2500);

    // phase 3 — attacker replays toward block 3
    at(() => {
      setPhase(3); sfxAlert();
      let rp = 0;
      const iv2 = setInterval(() => {
        rp = Math.min(rp + 3, 100);
        setReplayPos(rp);
        if (rp >= 100) clearInterval(iv2);
      }, 35);
    }, 4000);

    // phase 4 — verification runs
    at(() => { setShowVerify(true); sfxAlert(); }, 5800);

    // phase 5 — rejected
    at(() => { setPhase(4); setRejected(true); sfxReject(); }, 7200);

    at(() => runLoop(), 11500);
  };

  useEffect(() => { runLoop(); return clear; }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:'monospace', position:'relative', overflow:'hidden' }}>
      <MatrixRain />
      <div style={{ position:'relative', zIndex:1, padding:'30px', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <button onClick={() => navigate(-1)} style={{ background:'black', border:'1px solid #ffff00', color:'#ffff00', padding:'8px 16px', cursor:'pointer', fontFamily:'monospace' }}>
            BACK
          </button>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#ffff00', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 20px #ffff00' }}>REPLAY ATTACK</div>
            <div style={{ color:'#ffff0066', fontSize:'10px', letterSpacing:'3px', marginTop:'4px' }}>STEAL A SIGNED TX AND REUSE IT ON ANOTHER BLOCK</div>
          </div>
          <div style={{ width:'80px' }} />
        </div>

        <div style={{ maxWidth:'780px', margin:'0 auto 28px', background:'#0a0a00', border:'1px solid #ffff0022', borderRadius:'8px', padding:'14px 18px', color:'#555', fontSize:'11px', lineHeight:'1.9' }}>
          A digital signature is tied to <span style={{ color:'#aaa' }}>specific tx data</span> (sender, receiver, amount).
          The attacker intercepts a valid signed tx and tries to replay it on a different block.
          This fails because the <span style={{ color:'#ffff00' }}>tx hash is different</span> for every block — the stolen signature simply does not match.
        </div>

        {/* Blocks + animation area */}
        <div style={{ maxWidth:'900px', margin:'0 auto', flex:1 }}>

          {/* Block row */}
          <div style={{ display:'flex', justifyContent:'space-around', alignItems:'flex-start', marginBottom:'20px', position:'relative' }}>

            {/* Block 2 — original signed */}
            <BlockCard
              title="BLOCK #2"
              color={phase >= 1 ? '#ffff00' : '#00ff00'}
              rows={[
                { l:'FROM',  v:TX.sender },
                { l:'TO',    v:TX.receiver },
                { l:'AMT',   v:TX.amount },
                { l:'SIG',   v:sig.substring(0,12)+'…', highlight: true },
              ]}
              badge={phase >= 1 ? 'TX BROADCAST' : 'SIGNED TX'}
              badgeColor={phase >= 1 ? '#ffff00' : '#00ff00'}
            />

            {/* Attacker in the middle */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:'40px' }}>
              <div style={{ width:'70px', height:'70px', borderRadius:'50%', background: phase >= 2 ? '#1a0000' : '#050505', border:`2px solid ${phase >= 2 ? '#ff0000' : '#333'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', transition:'all 0.5s', boxShadow: phase >= 2 ? '0 0 20px #ff000066' : 'none' }}>
                🦹
              </div>
              <div style={{ color: phase >= 2 ? '#ff0000' : '#333', fontSize:'9px', marginTop:'6px', letterSpacing:'1px', fontWeight:'bold' }}>
                {phase >= 2 ? 'ATTACKER' : 'NETWORK'}
              </div>
              {showStolenSig && (
                <div style={{ marginTop:'10px', background:'#1a0000', border:'1px solid #ff000066', borderRadius:'5px', padding:'8px 10px', fontSize:'9px', animation:'fadeInScale 0.3s ease', maxWidth:'130px', textAlign:'center' }}>
                  <div style={{ color:'#ff4444', fontWeight:'bold', marginBottom:'3px' }}>STOLEN SIG</div>
                  <div style={{ color:'#ff000088', wordBreak:'break-all', fontFamily:'monospace', lineHeight:'1.4' }}>{sig.substring(0,16)}…</div>
                </div>
              )}
            </div>

            {/* Block 3 — replay target */}
            <BlockCard
              title="BLOCK #3"
              color={rejected ? '#ff0000' : '#00ff00'}
              rows={[
                { l:'FROM',  v:TX3.sender },
                { l:'TO',    v:TX3.receiver },
                { l:'AMT',   v:TX3.amount },
                { l:'SIG',   v: rejected ? 'INVALID ✕' : (phase >= 3 ? sig.substring(0,12)+'… ?' : '—'), highlight: phase >= 3 },
              ]}
              badge={rejected ? 'REJECTED' : phase >= 3 ? 'REPLAY ATTEMPT' : 'TARGET'}
              badgeColor={rejected ? '#ff0000' : phase >= 3 ? '#ffff00' : '#00ff00'}
              shake={rejected}
            />
          </div>

          {/* Moving packet */}
          {phase >= 1 && phase < 2 && (
            <div style={{ position:'relative', height:'30px', maxWidth:'900px', margin:'0 auto' }}>
              <div style={{ position:'absolute', left:`${packetPos * 0.35}%`, top:0, fontSize:'16px', transition:'left 0.03s linear' }}>📦</div>
            </div>
          )}

          {/* Replay packet */}
          {phase >= 3 && phase < 4 && (
            <div style={{ position:'relative', height:'30px', maxWidth:'900px', margin:'0 auto' }}>
              <div style={{ position:'absolute', left:`${50 + replayPos * 0.28}%`, top:0, fontSize:'16px', transition:'left 0.03s linear' }}>🔁</div>
            </div>
          )}

          {/* Verification box */}
          {showVerify && (
            <div style={{ maxWidth:'600px', margin:'0 auto', background:'#050505', border:'1px solid #333', borderRadius:'8px', padding:'16px 20px', animation:'fadeInScale 0.3s ease' }}>
              <div style={{ color:'#555', fontSize:'10px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'12px' }}>NODE VERIFICATION</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <HashRow label="ORIGINAL TX HASH (Block #2)" value={origHash} color="#ffff00" />
                <HashRow label="BLOCK #3 TX HASH (different data)" value={tx3Hash} color="#ff6600" />
                <div style={{ display:'flex', justifyContent:'center', fontSize:'10px', marginTop:'4px', color:'#555' }}>↓ sha256(txHash + privateKey) must equal stored signature</div>
                <HashRow label="STOLEN SIGNATURE was computed for" value={origHash.substring(0,20)+'… (Block #2)'} color="#ff000066" />
              </div>

              {rejected && (
                <div style={{ marginTop:'14px', background:'#1a0000', border:'2px solid #ff0000', borderRadius:'6px', padding:'12px', textAlign:'center', animation:'fadeInScale 0.3s ease', boxShadow:'0 0 20px #ff000044' }}>
                  <div style={{ color:'#ff0000', fontSize:'15px', fontWeight:'bold', letterSpacing:'3px' }}>SIGNATURE INVALID — TRANSACTION REJECTED</div>
                  <div style={{ color:'#555', fontSize:'9px', marginTop:'6px' }}>The hashes differ. The stolen signature proves nothing for Block #3.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phase label */}
        <div style={{ textAlign:'center', marginTop:'24px', minHeight:'28px' }}>
          {phase === 0 && <PL col="#00ff00" text="BLOCK #2 HAS A VALID SIGNED TRANSACTION" />}
          {phase === 1 && <PL col="#ffff00" text="TX BROADCAST TO THE NETWORK..." />}
          {phase === 2 && <PL col="#ff4444" text="ATTACKER INTERCEPTS AND STEALS THE SIGNATURE!" />}
          {phase === 3 && <PL col="#ffff00" text="ATTACKER TRIES TO REPLAY STOLEN SIGNATURE ON BLOCK #3..." />}
          {phase >= 4  && <PL col="#00ff00" text="NODE VERIFIES — TX HASHES DIFFER — REPLAY REJECTED" />}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
}

function BlockCard({ title, color, rows, badge, badgeColor, shake }) {
  return (
    <div style={{ background:'#050505', border:`2px solid ${color}44`, borderRadius:'10px', padding:'16px', width:'190px', flexShrink:0, transition:'border-color 0.4s', animation: shake ? 'shake 0.5s ease' : 'none', boxShadow:`0 0 15px ${color}22` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px', borderBottom:`1px solid ${color}33`, paddingBottom:'6px' }}>
        <span style={{ color, fontSize:'11px', fontWeight:'bold' }}>{title}</span>
        <span style={{ color: badgeColor, fontSize:'8px', fontWeight:'bold' }}>{badge}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #0d0d0d', padding:'3px 0', fontSize:'9px' }}>
          <span style={{ color:'#333' }}>{r.l}</span>
          <span style={{ color: r.highlight ? badgeColor : color, fontFamily:'monospace' }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}
function HashRow({ label, value, color }) {
  return (
    <div style={{ background:'#0a0a0a', border:`1px solid ${color}22`, borderRadius:'4px', padding:'8px 10px' }}>
      <div style={{ color:'#444', fontSize:'9px', marginBottom:'3px', letterSpacing:'1px' }}>{label}</div>
      <div style={{ color, fontFamily:'monospace', fontSize:'9px', wordBreak:'break-all', lineHeight:'1.4' }}>{value}</div>
    </div>
  );
}
function PL({ col, text }) {
  return <div style={{ color:col, fontSize:'12px', letterSpacing:'2px', fontWeight:'bold', textShadow:`0 0 12px ${col}` }}>{text}</div>;
}