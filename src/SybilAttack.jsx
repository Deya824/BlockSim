import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatrixRain from './MatrixRain';
import { sfxFlood, sfxLotterySpin, sfxWinner, sfxReject, sfxSuccess } from './attackSounds';

const REAL = [
  { name:'YOU',      emoji:'🧑‍💻', stake:32, real:true  },
  { name:'Monica',   emoji:'👩‍🍳', stake:28, real:true  },
  { name:'Joey',     emoji:'🎭',  stake:15, real:true  },
  { name:'Rachel',   emoji:'👗',  stake:40, real:true  },
  { name:'Ross',     emoji:'🦕',  stake:22, real:true  },
  { name:'Chandler', emoji:'💼',  stake:35, real:true  },
  { name:'Phoebe',   emoji:'🎸',  stake:18, real:true  },
];
const FAKES = [
  { name:'SYBIL_01', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_02', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_03', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_04', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_05', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_06', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_07', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_08', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_09', emoji:'🤖', stake:1, real:false },
  { name:'SYBIL_10', emoji:'🤖', stake:1, real:false },
];

export default function SybilAttack() {
  const navigate = useNavigate();

  // Phases: 0=honest pool, 1=fakes flooding in one by one, 2=lottery runs, 3=sybil wins, 4=show defense, loop
  const [phase,      setPhase]      = useState(0);
  const [pool,       setPool]       = useState(REAL);
  const [winner,     setWinner]     = useState(null);
  const [showOdds,   setShowOdds]   = useState(false);
  const [showDefense,setShowDefense]= useState(false);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const runLoop = () => {
    clear();
    setPhase(0); setPool(REAL); setWinner(null); setShowOdds(false); setShowDefense(false);

    // Phase 1: flood fakes one by one
    at(() => setPhase(1), 1200);
    FAKES.forEach((f, i) => {
      at(() => { setPool(prev => [...prev, f]); sfxFlood(); }, 1800 + i * 350);
    });

    // Show odds after all fakes added
    at(() => setShowOdds(true), 1800 + FAKES.length * 350 + 400);

    // Phase 2: run lottery
    at(() => { setPhase(2); sfxLotterySpin(); }, 1800 + FAKES.length * 350 + 1400);

    // Phase 3: sybil wins
    at(() => {
      setPhase(3);
      const w = FAKES[Math.floor(Math.random() * FAKES.length)];
      setWinner(w);
      sfxReject();
    }, 1800 + FAKES.length * 350 + 3200);

    // Phase 4: show defense
    at(() => { setShowDefense(true); sfxSuccess(); }, 1800 + FAKES.length * 350 + 5000);

    // Loop
    at(() => runLoop(), 1800 + FAKES.length * 350 + 8500);
  };

  useEffect(() => { runLoop(); return clear; }, []);

  const realCount = pool.filter(v => v.real).length;
  const fakeCount = pool.filter(v => !v.real).length;
  const attackOdds = Math.round((fakeCount / pool.length) * 100);

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:'monospace', position:'relative', overflow:'hidden' }}>
      <MatrixRain />
      <div style={{ position:'relative', zIndex:1, padding:'30px', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <button onClick={() => navigate(-1)} style={{ background:'black', border:'1px solid #d800ff', color:'#d800ff', padding:'8px 16px', cursor:'pointer', fontFamily:'monospace' }}>BACK</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#d800ff', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 20px #d800ff' }}>SYBIL ATTACK</div>
            <div style={{ color:'#d800ff66', fontSize:'10px', letterSpacing:'3px', marginTop:'4px' }}>FLOOD THE VALIDATOR POOL WITH FAKE IDENTITIES</div>
          </div>
          <div style={{ width:'80px' }} />
        </div>

        <div style={{ maxWidth:'780px', margin:'0 auto 28px', background:'#0a000f', border:'1px solid #d800ff22', borderRadius:'8px', padding:'14px 18px', color:'#555', fontSize:'11px', lineHeight:'1.9' }}>
          In a naive lottery where each <span style={{ color:'#aaa' }}>identity gets one ticket</span>, flooding the pool with fake identities
          inflates the attacker's share. Real networks defend this with <span style={{ color:'#d800ff' }}>minimum stake requirements</span> and
          weighting by stake size — making each fake identity very expensive.
        </div>

        <div style={{ maxWidth:'900px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', flex:1 }}>

          {/* Validator pool */}
          <div>
            <div style={{ color:'#d800ff', fontSize:'11px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'14px', textAlign:'center' }}>
              VALIDATOR POOL — {pool.length} IDENTITIES
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', justifyContent:'center' }}>
              {pool.map((v, i) => (
                <div key={i} style={{
                  width:'62px', padding:'8px 4px',
                  background: winner?.name === v.name ? (v.real ? '#001a00' : '#1a0000') : v.real ? '#050505' : '#0a0005',
                  border:`1px solid ${winner?.name === v.name ? (v.real ? '#00ff00' : '#ff0000') : v.real ? '#d800ff33' : '#ff000033'}`,
                  borderRadius:'6px', textAlign:'center',
                  animation: !v.real ? 'popIn 0.3s ease' : 'none',
                  boxShadow: winner?.name === v.name ? `0 0 15px ${v.real ? '#00ff00' : '#ff0000'}` : 'none',
                  transition:'all 0.4s',
                }}>
                  <div style={{ fontSize:'18px' }}>{v.emoji}</div>
                  <div style={{ color: v.real ? '#d800ff66' : '#ff000066', fontSize:'7px', marginTop:'3px' }}>{v.name}</div>
                  <div style={{ color: v.real ? '#d800ff' : '#ff4444', fontSize:'8px', fontWeight:'bold' }}>{v.stake}Ξ</div>
                  {!v.real && <div style={{ color:'#ff0000', fontSize:'6px', marginTop:'1px' }}>FAKE</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: odds + result */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Odds bar */}
            {showOdds && (
              <div style={{ animation:'fadeInScale 0.3s ease' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'5px' }}>
                  <span style={{ color:'#00ff00' }}>HONEST {100 - attackOdds}%</span>
                  <span style={{ color:'#ff0000' }}>SYBIL {attackOdds}%</span>
                </div>
                <div style={{ height:'16px', background:'#111', borderRadius:'8px', overflow:'hidden', border:'1px solid #333', display:'flex' }}>
                  <div style={{ width:`${100 - attackOdds}%`, background:'linear-gradient(90deg,#00ff0044,#00ff00)', transition:'width 0.6s' }} />
                  <div style={{ width:`${attackOdds}%`, background:'linear-gradient(90deg,#ff000044,#ff0000)', transition:'width 0.6s' }} />
                </div>
                <div style={{ color:'#ff4444', fontSize:'10px', textAlign:'center', marginTop:'6px', fontWeight:'bold' }}>
                  {attackOdds}% CHANCE ATTACKER WINS LOTTERY
                </div>
              </div>
            )}

            {/* Lottery spinning */}
            {phase === 2 && !winner && (
              <div style={{ background:'#0a000f', border:'1px solid #d800ff44', borderRadius:'8px', padding:'20px', textAlign:'center', animation:'fadeInScale 0.3s ease' }}>
                <div style={{ fontSize:'36px', animation:'spin 0.5s linear infinite' }}>🎰</div>
                <div style={{ color:'#d800ff', fontSize:'11px', letterSpacing:'2px', marginTop:'10px' }}>RUNNING LOTTERY...</div>
              </div>
            )}

            {/* Winner */}
            {winner && (
              <div style={{ background: winner.real ? '#001a00' : '#1a0000', border:`2px solid ${winner.real ? '#00ff00' : '#ff0000'}`, borderRadius:'8px', padding:'20px', textAlign:'center', animation:'fadeInScale 0.4s ease', boxShadow:`0 0 30px ${winner.real ? '#00ff0033' : '#ff000033'}` }}>
                <div style={{ fontSize:'40px', marginBottom:'8px' }}>{winner.emoji}</div>
                <div style={{ color: winner.real ? '#00ff00' : '#ff0000', fontSize:'15px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'6px' }}>
                  {winner.real ? `${winner.name} WON — HONEST` : `${winner.name} WON — SYBIL!`}
                </div>
                <div style={{ color:'#555', fontSize:'10px' }}>
                  {winner.real
                    ? 'Honest validator selected — Sybil attack failed this round.'
                    : 'Fake identity wins the block! Attacker controls next block.'}
                </div>
              </div>
            )}

            {/* Defense info */}
            {showDefense && (
              <div style={{ background:'#000a00', border:'1px solid #00ff0033', borderRadius:'8px', padding:'16px', animation:'fadeInScale 0.3s ease' }}>
                <div style={{ color:'#00ff00', fontSize:'10px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'8px' }}>HOW REAL NETWORKS DEFEND</div>
                {['Minimum 32 ETH stake requirement', 'Lottery weighted by stake size', 'Slashing for malicious validators', 'Identity verification via deposit'].map((t, i) => (
                  <div key={i} style={{ color:'#555', fontSize:'10px', marginBottom:'5px', display:'flex', gap:'6px' }}>
                    <span style={{ color:'#00ff00' }}>✓</span>{t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'24px', minHeight:'28px' }}>
          {phase === 0 && <PL col="#00ff00" text="HONEST VALIDATOR POOL — 7 REAL VALIDATORS" />}
          {phase === 1 && <PL col="#ff4444" text={`ATTACKER FLOODING POOL WITH FAKE IDENTITIES... (${fakeCount} added)`} />}
          {phase === 2 && <PL col="#d800ff" text="RUNNING VALIDATOR LOTTERY..." />}
          {phase === 3 && winner && <PL col={winner.real ? '#00ff00' : '#ff0000'} text={winner.real ? 'HONEST VALIDATOR WON THIS ROUND' : 'SYBIL IDENTITY WON — ATTACKER CONTROLS BLOCK'} />}
        </div>
      </div>

      <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

function PL({ col, text }) {
  return <div style={{ color:col, fontSize:'12px', letterSpacing:'2px', fontWeight:'bold', textShadow:`0 0 12px ${col}` }}>{text}</div>;
}