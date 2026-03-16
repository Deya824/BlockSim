import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatrixRain from './MatrixRain';
import { sfxAlert, sfxBroadcast, sfxSuccess, sfxOrphan, sfxMineStart } from './attackSounds';

export default function DoubleSpendAttack() {
  const navigate = useNavigate();

  // Phases:
  // 0 = wallet has 50 coins
  // 1 = two tx broadcast simultaneously
  // 2 = fork forms
  // 3 = both chains mining
  // 4 = honest chain wins (more blocks)
  // 5 = fork B orphaned, attacker's tx erased
  // loop

  const [phase,      setPhase]      = useState(0);
  const [forkA,      setForkA]      = useState(1);
  const [forkB,      setForkB]      = useState(1);
  const [showFork,   setShowFork]   = useState(false);
  const [resolved,   setResolved]   = useState(false);
  const [winner,     setWinner]     = useState(null);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const at = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const mineStopRef = useRef(null);

  const runLoop = () => {
    clear();
    if (mineStopRef.current) { mineStopRef.current(); mineStopRef.current = null; }
    setPhase(0); setForkA(1); setForkB(1); setShowFork(false); setResolved(false); setWinner(null);

    at(() => { setPhase(1); sfxAlert(); }, 1200);
    at(() => { setPhase(2); setShowFork(true); sfxBroadcast(); }, 2800);

    // both chains add blocks
    at(() => {
      setPhase(3);
      mineStopRef.current = sfxMineStart();
    }, 3600);

    let a = 1, b = 1;
    const iv = setInterval(() => {
      if (Math.random() > 0.4) { a++; setForkA(a); sfxSuccess(); }
      else                     { b++; setForkB(b); sfxSuccess(); }
    }, 700);
    timers.current.push(iv);

    // resolve — honest chain (A) wins
    at(() => {
      clearInterval(iv);
      if (mineStopRef.current) { mineStopRef.current(); mineStopRef.current = null; }
      setForkA(5); setForkB(3);
      setPhase(4); sfxBroadcast();
      setTimeout(() => { setResolved(true); setWinner('A'); setPhase(5); sfxOrphan(); }, 800);
    }, 7000);

    at(() => runLoop(), 12000);
  };

  useEffect(() => { runLoop(); return clear; }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:'monospace', position:'relative', overflow:'hidden' }}>
      <MatrixRain />
      <div style={{ position:'relative', zIndex:1, padding:'30px', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <button onClick={() => navigate(-1)} style={{ background:'black', border:'1px solid #00ffff', color:'#00ffff', padding:'8px 16px', cursor:'pointer', fontFamily:'monospace' }}>BACK</button>
          <div style={{ textAlign:'center' }}>
            <div style={{ color:'#00ffff', fontSize:'22px', fontWeight:'bold', letterSpacing:'4px', textShadow:'0 0 20px #00ffff' }}>DOUBLE SPEND</div>
            <div style={{ color:'#00ffff66', fontSize:'10px', letterSpacing:'3px', marginTop:'4px' }}>SPEND THE SAME COINS TWICE ON TWO FORKS</div>
          </div>
          <div style={{ width:'80px' }} />
        </div>

        <div style={{ maxWidth:'780px', margin:'0 auto 28px', background:'#000a0a', border:'1px solid #00ffff22', borderRadius:'8px', padding:'14px 18px', color:'#555', fontSize:'11px', lineHeight:'1.9' }}>
          The attacker broadcasts <span style={{ color:'#aaa' }}>two conflicting transactions</span> spending the same coins simultaneously.
          Both propagate through the network creating a <span style={{ color:'#00ffff' }}>fork</span>.
          The network resolves by accepting the <span style={{ color:'#00ffff' }}>longest chain</span> — the other is orphaned and its transaction disappears.
          Waiting for <span style={{ color:'#00ffff' }}>6+ confirmations</span> makes this attack impractical.
        </div>

        {/* Wallet */}
        <div style={{ maxWidth:'300px', margin:'0 auto 28px', background:'#050505', border:`1px solid ${phase >= 1 ? '#ffff00' : '#00ffff33'}`, borderRadius:'8px', padding:'14px 18px', textAlign:'center', transition:'all 0.5s' }}>
          <div style={{ fontSize:'28px', marginBottom:'6px' }}>👛</div>
          <div style={{ color:'#00ffff', fontSize:'11px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'4px' }}>ATTACKER WALLET</div>
          <div style={{ color:'#ffff00', fontSize:'22px', fontWeight:'bold' }}>50 COINS</div>
          {phase >= 1 && (
            <div style={{ color:'#ff4444', fontSize:'10px', marginTop:'6px', animation:'blink 0.6s infinite' }}>
              BROADCASTING 2 TXs WITH SAME COINS!
            </div>
          )}
        </div>

        {/* Two transactions */}
        {phase >= 1 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', maxWidth:'700px', margin:'0 auto 24px', animation:'fadeInScale 0.4s ease' }}>
            <TxCard
              title="TX A — TO MERCHANT"
              color="#00ff00"
              from="ATTACKER"
              to="MERCHANT"
              amount={50}
              note="Legitimate payment"
              orphaned={resolved && winner === 'A' ? false : resolved}
            />
            <TxCard
              title="TX B — TO SELF"
              color="#ff0000"
              from="ATTACKER"
              to="ATTACKER_2"
              amount={50}
              note="Same coins — double spend!"
              orphaned={resolved && winner === 'A'}
            />
          </div>
        )}

        {/* Fork visualization */}
        {showFork && (
          <div style={{ maxWidth:'700px', margin:'0 auto 24px', animation:'fadeInScale 0.4s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <ChainViz
                label="FORK A (HONEST)"
                color="#00ff00"
                blocks={forkA}
                winner={resolved && winner === 'A'}
                loser={resolved && winner !== 'A'}
              />
              <ChainViz
                label="FORK B (ATTACKER)"
                color="#ff0000"
                blocks={forkB}
                winner={resolved && winner === 'B'}
                loser={resolved && winner !== 'B'}
              />
            </div>
          </div>
        )}

        {/* Result */}
        {resolved && (
          <div style={{ maxWidth:'560px', margin:'0 auto', background:'#001a00', border:'2px solid #00ff00', borderRadius:'10px', padding:'20px 28px', textAlign:'center', animation:'fadeInScale 0.4s ease', boxShadow:'0 0 40px #00ff0033' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>🛡️</div>
            <div style={{ color:'#00ff00', fontSize:'15px', fontWeight:'bold', letterSpacing:'3px', marginBottom:'8px' }}>HONEST CHAIN WINS — DOUBLE SPEND FAILED</div>
            <div style={{ color:'#555', fontSize:'10px', lineHeight:'1.9' }}>
              Fork A was longer. The network accepted it and <span style={{ color:'#ff4444' }}>orphaned Fork B</span>.
              TX B is erased from history — the merchant's payment is the only valid one.
              Waiting for 6+ block confirmations makes this attack <span style={{ color:'#00ff00' }}>economically infeasible</span>.
            </div>
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:'24px', minHeight:'28px' }}>
          {phase === 0 && <PL col="#00ffff" text="ATTACKER HAS 50 COINS IN WALLET" />}
          {phase === 1 && <PL col="#ffff00" text="BROADCASTING TWO TRANSACTIONS WITH SAME COINS..." />}
          {phase === 2 && <PL col="#ff4444" text="NETWORK FORK CREATED — TWO CHAINS COMPETING" />}
          {phase === 3 && <PL col="#ff6600" text={`BOTH CHAINS MINING... FORK A: ${forkA} BLOCKS | FORK B: ${forkB} BLOCKS`} />}
          {phase === 4 && <PL col="#00ff00" text="FORK A LONGER — NETWORK SWITCHING..." />}
          {phase === 5 && <PL col="#00ff00" text="FORK B ORPHANED — DOUBLE SPEND TX ERASED FROM HISTORY" />}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeInScale { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes newBlock { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

function TxCard({ title, color, from, to, amount, note, orphaned }) {
  return (
    <div style={{ background: orphaned ? '#0a0000' : '#050505', border:`1px solid ${orphaned ? '#ff000033' : color + '44'}`, borderRadius:'8px', padding:'14px', opacity: orphaned ? 0.5 : 1, transition:'all 0.6s' }}>
      <div style={{ color: orphaned ? '#ff4444' : color, fontSize:'10px', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px' }}>
        {orphaned ? '✕ ORPHANED — ' : ''}{title}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'4px' }}>
        <span style={{ color:'#444' }}>FROM</span><span style={{ color: orphaned ? '#442200' : color }}>{from}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'4px' }}>
        <span style={{ color:'#444' }}>TO</span><span style={{ color: orphaned ? '#442200' : color }}>{to}</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', marginBottom:'8px' }}>
        <span style={{ color:'#444' }}>AMT</span><span style={{ color: orphaned ? '#442200' : '#ffff00', fontWeight:'bold' }}>{amount}</span>
      </div>
      <div style={{ color: orphaned ? '#442200' : '#555', fontSize:'9px', fontStyle:'italic' }}>{note}</div>
    </div>
  );
}

function ChainViz({ label, color, blocks, winner, loser }) {
  return (
    <div style={{ opacity: loser ? 0.35 : 1, transition:'opacity 0.8s' }}>
      <div style={{ color: winner ? '#00ff00' : loser ? '#ff000066' : color, fontSize:'10px', fontWeight:'bold', letterSpacing:'1px', marginBottom:'8px', textAlign:'center' }}>
        {winner ? '✓ ACCEPTED — ' : loser ? '✕ ORPHANED — ' : ''}{label}
      </div>
      <div style={{ display:'flex', gap:'4px', justifyContent:'center', flexWrap:'wrap' }}>
        {Array.from({ length: blocks }).map((_, i) => (
          <div key={i} style={{
            width:'36px', height:'36px', background: winner ? '#001a00' : loser ? '#1a0000' : '#050505',
            border:`1px solid ${winner ? '#00ff00' : loser ? '#ff000033' : color + '44'}`,
            borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'9px', color: winner ? '#00ff00' : loser ? '#ff000055' : color,
            fontWeight:'bold', animation: i === blocks - 1 ? 'newBlock 0.3s ease' : 'none',
          }}>
            #{i+1}
          </div>
        ))}
      </div>
      <div style={{ color: winner ? '#00ff00' : loser ? '#ff000055' : color + '66', fontSize:'9px', textAlign:'center', marginTop:'6px' }}>
        {blocks} block{blocks !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function PL({ col, text }) {
  return <div style={{ color:col, fontSize:'12px', letterSpacing:'2px', fontWeight:'bold', textShadow:`0 0 12px ${col}` }}>{text}</div>;
}