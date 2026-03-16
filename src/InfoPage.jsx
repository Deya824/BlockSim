import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// No counting animation — show static values immediately

function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function StepCard({ num, title, body, color, delay = 0, visible }) {
  return (
    <div style={{
      display:'flex', gap:'20px', padding:'20px 24px',
      background:'rgba(255,255,255,0.02)',
      border:`1px solid ${color}22`, borderLeft:`4px solid ${color}`,
      borderRadius:'6px', marginBottom:'12px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-24px)',
      transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      <div style={{ color, fontFamily:"'Courier New',monospace", fontSize:'1.3rem', fontWeight:'bold', minWidth:'34px' }}>{num}</div>
      <div>
        <div style={{ color:'#fff', fontWeight:'bold', marginBottom:'5px', fontFamily:"'Courier New',monospace", fontSize:'13px', letterSpacing:'1px' }}>{title}</div>
        <div style={{ color:'#ddd', fontSize:'1.1rem', lineHeight:'1.95', fontFamily:"'Inter','Segoe UI',Arial,sans-serif" }}>{body}</div>
      </div>
    </div>
  );
}

function StatBox({ label, value, suffix='', color }) {
  return (
    <div style={{ textAlign:'center', padding:'24px 16px', background:'rgba(0,0,0,0.5)', border:`1px solid ${color}22`, borderRadius:'8px', flex:1, minWidth:'140px' }}>
      <div style={{ color, fontFamily:"'Courier New',monospace", fontSize:'2rem', fontWeight:'bold', textShadow:`0 0 20px ${color}` }}>{value}{suffix}</div>
      <div style={{ color:'#999', fontSize:'9px', letterSpacing:'2px', marginTop:'6px', textTransform:'uppercase' }}>{label}</div>
    </div>
  );
}

function SectionLabel({ label, color, visible }) {
  return (
    <div style={{ color, fontSize:'12px', letterSpacing:'4px', marginBottom:'16px', opacity: visible?1:0, transition:'opacity 0.5s ease', display:'flex', alignItems:'center', gap:'12px' }}>
      <div style={{ width:'28px', height:'1px', background:color }} />{label}
    </div>
  );
}

function Divider() {
  return <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,#00ff0022,transparent)', margin:'80px 0' }} />;
}

export default function InfoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pow');
  const [headerVis, setHeaderVis] = useState(false);
  const [statsRef, statsVis] = useVisible(0.3);
  const [s1ref,s1v]=useVisible(); const [s2ref,s2v]=useVisible();
  const [s3ref,s3v]=useVisible(); const [s4ref,s4v]=useVisible();
  const [s5ref,s5v]=useVisible(); const [s6ref,s6v]=useVisible();
  const [s7ref,s7v]=useVisible();

  useEffect(() => { window.scrollTo(0,0); setTimeout(()=>setHeaderVis(true),100); }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#e5e5e5', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", overflowX:'hidden', position:'relative' }}>

      {/* Scanlines */}
      <div style={{ position:'fixed', inset:0, background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)', pointerEvents:'none', zIndex:9998 }} />
      {/* Grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(0,255,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,0,0.025) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }} />

      {/* Nav */}
      <button onClick={()=>navigate('/')}
        style={{ position:'fixed', top:'20px', left:'20px', zIndex:100, background:'rgba(0,0,0,0.85)', border:'1px solid #00ff00', color:'#00ff00', padding:'10px 20px', fontFamily:"'Courier New',monospace", cursor:'pointer', fontSize:'13px', letterSpacing:'1px', backdropFilter:'blur(10px)', transition:'all 0.2s' }}
        onMouseEnter={e=>{e.currentTarget.style.background='#00ff00';e.currentTarget.style.color='#000';}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.85)';e.currentTarget.style.color='#00ff00';}}>
        &lt;&lt; BACK
      </button>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 20px', background:'radial-gradient(ellipse at 50% 60%,#001a0055 0%,transparent 70%)' }}>
          <div style={{ opacity:headerVis?1:0, transform:headerVis?'translateY(0)':'translateY(-30px)', transition:'all 0.9s ease' }}>
            <div style={{ color:'#00ff0055', fontSize:'13px', letterSpacing:'6px', marginBottom:'20px' }}>DECENTRALIZED LEDGER TECHNOLOGY // v3.0</div>
            <h1 style={{ fontSize:'clamp(3rem,8vw,7rem)', fontWeight:'bold', margin:'0 0 10px', lineHeight:1, color:'#fff', textShadow:'0 0 40px rgba(0,255,0,0.3),0 0 80px rgba(0,255,0,0.1)' }}>BLOCKCHAIN</h1>
            <h2 style={{ fontSize:'clamp(1rem,3vw,2rem)', color:'#00ff00', margin:'0 0 32px', letterSpacing:'8px', fontWeight:'normal' }}>DECODED</h2>
            <p style={{ maxWidth:'580px', margin:'0 auto 48px', color:'#bbb', fontSize:'1.1rem', lineHeight:'2', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontStyle:'italic' }}>
              A complete technical breakdown — from cryptographic hashing to consensus mechanisms, attack vectors, wallets, and real-world applications.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              {['#architecture','#cryptography','#consensus','#wallets','#attacks','#data-structures','#real-world'].map((href,i) => {
                const labels = ['ARCHITECTURE','CRYPTOGRAPHY','CONSENSUS','WALLETS','ATTACKS','MERKLE','REAL WORLD'];
                return (
                  <a key={i} href={href} style={{ color:'#00ff0066', fontSize:'11px', letterSpacing:'2px', textDecoration:'none', padding:'8px 14px', border:'1px solid #00ff0022', borderRadius:'2px', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.color='#00ff00';e.currentTarget.style.borderColor='#00ff00';}}
                    onMouseLeave={e=>{e.currentTarget.style.color='#00ff0066';e.currentTarget.style.borderColor='#00ff0022';}}>
                    {labels[i]}
                  </a>
                );
              })}
            </div>
          </div>
          <div style={{ position:'absolute', bottom:'40px', color:'#00ff0033', fontSize:'20px', animation:'bounce 2s ease-in-out infinite' }}>↓</div>
        </div>


                <div style={{ maxWidth:'960px', margin:'0 auto', padding:'80px 24px' }}>

          {/* ══ 01 ARCHITECTURE ══ */}
          <div id="architecture" ref={s1ref}>
            <SectionLabel label="01 / ARCHITECTURE" color="#00ff00" visible={s1v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'24px', opacity:s1v?1:0, transition:'opacity 0.6s ease 0.2s', lineHeight:1.1 }}>What Is A<br /><span style={{ color:'#00ff00' }}>Blockchain?</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #00ff0022', opacity:s1v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=960&auto=format&fit=crop&q=80" alt="blockchain network" style={{ width:'100%', height:'260px', objectFit:'cover', display:'block', filter:'brightness(0.7) saturate(0.8)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#00ff0066', fontSize:'9px', letterSpacing:'2px' }}>DISTRIBUTED LEDGER — NODES ACROSS THE GLOBE</div>
            </div>
            <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'32px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem', opacity:s1v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              A blockchain is a shared, append-only ledger of transactions maintained by a distributed network of computers. No central authority controls it — consensus rules decide what gets added. Once written, data cannot be altered without redoing all subsequent work.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'18px', marginBottom:'36px' }}>
              {[
                { icon:'⛓️', title:'CHAIN OF BLOCKS', body:'Each block contains a hash of the previous block, timestamp, and transaction data — forming an unbreakable cryptographic chain.', color:'#00ff00' },
                { icon:'🌐', title:'DISTRIBUTED NETWORK', body:'Thousands of nodes each hold a full copy. No single point of failure. If 99% of nodes disappear, the network survives.', color:'#00ffff' },
                { icon:'🔒', title:'IMMUTABILITY', body:'Altering a block changes its hash, breaking every block after it. You would need to redo all that work faster than the entire network.', color:'#ffff00' },
                { icon:'🤝', title:'TRUSTLESS', body:'You do not need to trust any participant. The math and consensus rules enforce honesty — cheating is economically irrational.', color:'#ff6600' },
              ].map((c,i)=>(
                <div key={i} style={{ background:'#0a0a0a', border:`1px solid ${c.color}22`, borderRadius:'10px', padding:'24px', opacity:s1v?1:0, transform:s1v?'translateY(0)':'translateY(20px)', transition:`all 0.5s ease ${0.2+i*0.12}s` }}>
                  <div style={{ fontSize:'28px', marginBottom:'12px' }}>{c.icon}</div>
                  <div style={{ color:c.color, fontWeight:'bold', letterSpacing:'1px', marginBottom:'8px', fontSize:'13px' }}>{c.title}</div>
                  <div style={{ color:'#aaa', fontSize:'1rem', lineHeight:'1.9' }}>{c.body}</div>
                </div>
              ))}
            </div>

            {/* Block anatomy */}
            <div style={{ background:'#080808', border:'1px solid #00ff0022', borderRadius:'10px', padding:'28px', opacity:s1v?1:0, transition:'opacity 0.6s ease 0.6s' }}>
              <div style={{ color:'#00ff00', fontSize:'10px', letterSpacing:'3px', marginBottom:'20px' }}>ANATOMY OF A BLOCK</div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { label:'HEADER', fields:['Version','Previous Hash','Merkle Root','Timestamp','Difficulty Target','Nonce'], color:'#00ff00' },
                  { label:'BODY', fields:['Transaction #1','Transaction #2','Transaction #3','...','Transaction #N (up to ~2500 in BTC)'], color:'#00ffff' },
                  { label:'HASH OUTPUT', fields:['hash(hash(Header))','→ 64 hex chars','→ 256 bits total','Must start with 000...','Stored as prev hash in next block'], color:'#ffff00' },
                ].map((b,i)=>(
                  <div key={i} style={{ flex:1, minWidth:'160px', background:'#050505', border:`1px solid ${b.color}22`, borderRadius:'6px', padding:'14px' }}>
                    <div style={{ color:b.color, fontSize:'9px', letterSpacing:'2px', marginBottom:'10px', fontWeight:'bold' }}>{b.label}</div>
                    {b.fields.map((f,j)=><div key={j} style={{ color:'#999', fontSize:'10px', padding:'4px 0', borderBottom:'1px solid #0d0d0d' }}>{f}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* ══ 02 CRYPTOGRAPHY ══ */}
          <div id="cryptography" ref={s2ref}>
            <SectionLabel label="02 / CRYPTOGRAPHY" color="#ffff00" visible={s2v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'24px', opacity:s2v?1:0, transition:'opacity 0.6s ease 0.2s' }}>Cryptographic<br /><span style={{ color:'#ffff00' }}>Hashing</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #ffff0022', opacity:s2v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=960&auto=format&fit=crop&q=80" alt="cryptography" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block', filter:'brightness(0.6) saturate(0.7) hue-rotate(20deg)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#ffff0066', fontSize:'9px', letterSpacing:'2px' }}>CRYPTOGRAPHIC HASHING — ONE-WAY FUNCTION</div>
            </div>
            <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'28px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem', opacity:s2v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              Cryptographic hash functions take any input and produce a fixed-length fingerprint. Identical inputs always produce identical outputs. Change one character — even a space — and the output is completely unrecognisable. This is the avalanche effect.
            </p>
            <div style={{ background:'#080808', border:'1px solid #ffff0022', borderRadius:'10px', padding:'24px', marginBottom:'28px', opacity:s2v?1:0, transition:'opacity 0.6s ease 0.4s' }}>
              <div style={{ color:'#ffff0044', fontSize:'10px', letterSpacing:'3px', marginBottom:'18px' }}>AVALANCHE EFFECT</div>
              {[
                { inp:'"Hello"',   hash:'185f8db32921bd46557571f4d2e3c3d5...', changed:false },
                { inp:'"hello"',   hash:'2cf24dba5fb0a30e26e83b2ac5b9e29e...', changed:true  },
                { inp:'"Hello!"',  hash:'334d016f755cd6dc58c53a86e183882f...', changed:true  },
                { inp:'"Hell0"',   hash:'7a68f09bd992671bb1b573c9bae8b10d...', changed:true  },
              ].map((r,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'10px', padding:'10px 14px', background:r.changed?'#120800':'#001200', border:`1px solid ${r.changed?'#ff660022':'#00ff0022'}`, borderRadius:'5px' }}>
                  <div style={{ color:r.changed?'#ff6600':'#00ff00', fontFamily:"'Courier New',monospace", fontSize:'13px', minWidth:'72px' }}>{r.inp}</div>
                  <div style={{ color:'#555', fontSize:'16px' }}>→</div>
                  <div style={{ color:r.changed?'#ff660066':'#00ff0066', fontFamily:"'Courier New',monospace", fontSize:'10px', wordBreak:'break-all', flex:1 }}>{r.hash}</div>
                  {r.changed && <div style={{ color:'#ff6600', fontSize:'8px', whiteSpace:'nowrap', flexShrink:0 }}>ENTIRELY DIFFERENT</div>}
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'12px', opacity:s2v?1:0, transition:'opacity 0.6s ease 0.5s' }}>
              {[
                { prop:'DETERMINISTIC', desc:'Same input always gives identical output' },
                { prop:'ONE-WAY', desc:'Impossible to reverse-engineer the input' },
                { prop:'AVALANCHE EFFECT', desc:'1 bit change → 50% of output bits flip' },
                { prop:'COLLISION RESISTANT', desc:'No two inputs have ever produced the same hash' },
              ].map((p,i)=>(
                <div key={i} style={{ background:'#0a0a0a', border:'1px solid #ffff0022', borderRadius:'6px', padding:'16px' }}>
                  <div style={{ color:'#ffff00', fontSize:'9px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'6px' }}>{p.prop}</div>
                  <div style={{ color:'#aaa', fontSize:'13px', lineHeight:'1.8' }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* ══ 03 CONSENSUS ══ */}
          <div id="consensus" ref={s3ref}>
            <SectionLabel label="03 / CONSENSUS MECHANISMS" color="#00ffff" visible={s3v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'32px', opacity:s3v?1:0, transition:'opacity 0.6s ease 0.2s' }}>How Nodes<br /><span style={{ color:'#00ffff' }}>Agree</span></h2>

            <div style={{ display:'flex', gap:'0', marginBottom:'28px', border:'1px solid #222', borderRadius:'6px', overflow:'hidden', opacity:s3v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              {[
                { id:'pow', label:'⛏️ PROOF OF WORK', col:'#00ff00' },
                { id:'pos', label:'⬡ PROOF OF STAKE', col:'#d800ff' },
                { id:'compare', label:'⚖️ COMPARISON', col:'#00ffff' },
              ].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1, padding:'13px 8px', border:'none', cursor:'pointer', fontFamily:"'Courier New',monospace", fontSize:'10px', letterSpacing:'1px', fontWeight:'bold', background:activeTab===t.id?t.col:'#0a0a0a', color:activeTab===t.id?'#000':'#444', transition:'all 0.2s', borderRight:'1px solid #111' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab==='pow' && (
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'24px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem' }}>
                  Miners compete to solve a computationally expensive puzzle. The first to find a nonce making the block hash start with enough zeros wins the right to add the block and earn the block reward. Real energy expenditure is the "work" — it secures the chain.
                </p>
                {[
                  { num:'01', title:'COLLECT TRANSACTIONS', body:'Pick pending transactions from the mempool. Include the coinbase transaction paying yourself the block reward.' },
                  { num:'02', title:'FIND THE NONCE', body:'Hash the block header repeatedly, incrementing the nonce (0, 1, 2, 3...) until the output starts with the required zeros. Bitcoin currently needs ~19 leading zeros — odds of ~1 in 10²².' },
                  { num:'03', title:'BROADCAST SOLUTION', body:'Announce the winning block to the network. Other nodes verify in <1ms — finding the solution is hard, checking it is trivial.' },
                  { num:'04', title:'EARN THE REWARD', body:'Receive the block subsidy (3.125 BTC post-2024 halving) plus all transaction fees. The next block begins immediately.' },
                ].map((s,i)=><StepCard key={i} {...s} color="#00ff00" delay={i*100} visible={true} />)}
                <div style={{ background:'#001100', border:'1px solid #00ff0022', borderRadius:'8px', padding:'18px', marginTop:'16px' }}>
                  <div style={{ color:'#00ff00', fontSize:'9px', letterSpacing:'2px', marginBottom:'6px' }}>DIFFICULTY ADJUSTMENT</div>
                  <div style={{ color:'#aaa', fontSize:'13px', lineHeight:'1.9' }}>Every 2016 blocks (~2 weeks), Bitcoin recalculates difficulty to maintain exactly 10-minute average block times — regardless of whether more or fewer miners join the network.</div>
                </div>
              </div>
            )}

            {activeTab==='pos' && (
              <div id="pos" style={{ animation:'fadeIn 0.3s ease' }}>
                <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'24px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem' }}>
                  Instead of spending energy, validators lock up cryptocurrency as collateral. A pseudo-random process weighted by stake selects who creates the next block. Bad behaviour means losing your stake — the economic punishment is the security mechanism.
                </p>
                {[
                  { num:'01', title:'LOCK YOUR STAKE', body:'Deposit a minimum amount (32 ETH on Ethereum) into the staking contract. These coins are locked and slashable while you are an active validator.' },
                  { num:'02', title:'VALIDATOR SELECTION', body:'The protocol pseudo-randomly selects a validator for each slot (every 12 seconds on Ethereum), weighted by stake size. More stake = higher probability.' },
                  { num:'03', title:'PROPOSE & ATTEST', body:'The selected validator proposes a new block. Other validators (a random committee) attest (vote) that the block follows the rules.' },
                  { num:'04', title:'SLASHING', body:'Sign two conflicting blocks, vote for an invalid chain, or go offline? Your stake gets slashed (partially confiscated) — making attacks economically self-destructive.' },
                ].map((s,i)=><StepCard key={i} {...s} color="#d800ff" delay={i*100} visible={true} />)}
                <div style={{ background:'#0a000f', border:'1px solid #d800ff22', borderRadius:'8px', padding:'18px', marginTop:'16px' }}>
                  <div style={{ color:'#d800ff', fontSize:'9px', letterSpacing:'2px', marginBottom:'6px' }}>THE MERGE — SEPTEMBER 2022</div>
                  <div style={{ color:'#aaa', fontSize:'13px', lineHeight:'1.9' }}>Ethereum switched from PoW to PoS, reducing energy consumption by ~99.95% overnight. The Beacon Chain (PoS consensus layer) merged with the execution layer. No user action was required.</div>
                </div>
              </div>
            )}

            {activeTab==='compare' && (
              <div style={{ animation:'fadeIn 0.3s ease', overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding:'12px 14px', textAlign:'left', color:'#333', borderBottom:'1px solid #1a1a1a', fontWeight:'normal', letterSpacing:'2px', fontSize:'9px' }}>PROPERTY</th>
                      <th style={{ padding:'12px 14px', textAlign:'center', color:'#00ff00', borderBottom:'1px solid #1a1a1a', letterSpacing:'2px', fontSize:'9px' }}>PROOF OF WORK</th>
                      <th style={{ padding:'12px 14px', textAlign:'center', color:'#d800ff', borderBottom:'1px solid #1a1a1a', letterSpacing:'2px', fontSize:'9px' }}>PROOF OF STAKE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Energy Use','⚡ Extremely High','🌱 ~99% Lower'],
                      ['Security Model','Hash Power (ASIC/GPU)','Economic Stake'],
                      ['Attack Cost','Buy 51% of hardware','Buy 51% of staked coins'],
                      ['Block Time','~10 min (Bitcoin)','~12 sec (Ethereum)'],
                      ['Finality','Probabilistic (wait 6 blocks)','Economic finality (~15 min)'],
                      ['Entry Barrier','Expensive hardware','Stake amount (32 ETH)'],
                      ['Used By','Bitcoin, Litecoin, Monero','Ethereum, Solana, Cardano'],
                      ['Validator Reward','Block subsidy + fees','Staking APY + fees'],
                    ].map(([prop,pow,pos],i)=>(
                      <tr key={i} style={{ background:i%2===0?'#050505':'transparent' }}>
                        <td style={{ padding:'13px 14px', color:'#ddd', borderBottom:'1px solid #0d0d0d' }}>{prop}</td>
                        <td style={{ padding:'13px 14px', color:'#00ff0066', textAlign:'center', borderBottom:'1px solid #0d0d0d' }}>{pow}</td>
                        <td style={{ padding:'13px 14px', color:'#d800ff66', textAlign:'center', borderBottom:'1px solid #0d0d0d' }}>{pos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Divider />

          {/* ══ 04 WALLETS ══ */}
          <div id="wallets" ref={s4ref}>
            <SectionLabel label="04 / WALLETS & KEYS" color="#00ffff" visible={s4v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'24px', opacity:s4v?1:0, transition:'opacity 0.6s ease 0.2s' }}>Public &amp; Private<br /><span style={{ color:'#00ffff' }}>Key Cryptography</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #00ffff22', opacity:s4v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=960&auto=format&fit=crop&q=80" alt="digital wallet" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block', filter:'brightness(0.6) saturate(0.8)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#00ffff66', fontSize:'9px', letterSpacing:'2px' }}>CRYPTOGRAPHIC KEYS — OWNERSHIP WITHOUT IDENTITY</div>
            </div>
            <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'28px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem', opacity:s4v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              A blockchain wallet doesn't store coins — it stores cryptographic keys. Your private key proves ownership. Your public key is your address. Anyone can send to your address; only the private key authorizes spending.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px', marginBottom:'28px', opacity:s4v?1:0, transition:'opacity 0.6s ease 0.4s' }}>
              {[
                { icon:'🔑', title:'PRIVATE KEY', color:'#ff6600', points:['256-bit random number','Never share with ANYONE','Signs (authorizes) transactions','Losing it = permanent loss of funds','Cannot be recovered by anyone'] },
                { icon:'📬', title:'PUBLIC KEY', color:'#00ffff', points:['Mathematically derived from private key','Safe to share publicly','Used to verify signatures','Hashed to produce your wallet address','Cannot reveal private key'] },
                { icon:'✍️', title:'DIGITAL SIGNATURE', color:'#00ff00', points:['Proves ownership without revealing key','sign(txHash + privateKey)','Unique for every transaction','Cannot be forged or replayed','Network verifies with public key only'] },
              ].map((k,i)=>(
                <div key={i} style={{ background:'#0a0a0a', border:`1px solid ${k.color}22`, borderRadius:'10px', padding:'22px' }}>
                  <div style={{ fontSize:'26px', marginBottom:'10px' }}>{k.icon}</div>
                  <div style={{ color:k.color, fontSize:'10px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'12px' }}>{k.title}</div>
                  {k.points.map((p,j)=>(
                    <div key={j} style={{ color:'#ddd', fontSize:'14px', padding:'6px 0', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", borderBottom:'1px solid #111', display:'flex', gap:'8px' }}>
                      <span style={{ color:k.color }}>›</span>{p}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Signing flow */}
            <div style={{ background:'#050505', border:'1px solid #00ffff22', borderRadius:'10px', padding:'24px', opacity:s4v?1:0, transition:'opacity 0.6s ease 0.5s' }}>
              <div style={{ color:'#00ffff44', fontSize:'10px', letterSpacing:'3px', marginBottom:'20px' }}>TRANSACTION SIGNING FLOW</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                {[
                  { label:'TX DATA', val:'{from, to, amount}', col:'#aaa' },
                  { arrow:'→ hash()' },
                  { label:'TX HASH', val:'a7f3d9e2...', col:'#ffff00' },
                  { arrow:'→ sign(hash + 🔑)' },
                  { label:'SIGNATURE', val:'b2e4f1c8...', col:'#00ff00' },
                  { arrow:'→ broadcast' },
                  { label:'NETWORK VERIFIES', val:'verify(hash + pubKey) == sig?', col:'#00ffff' },
                ].map((item,i)=>item.arrow
                  ? <div key={i} style={{ color:'#666', fontSize:'10px', textAlign:'center', flexShrink:0 }}>{item.arrow}</div>
                  : <div key={i} style={{ background:'#0a0a0a', border:`1px solid ${item.col}22`, borderRadius:'5px', padding:'10px 14px', flex:'1', minWidth:'100px' }}>
                      <div style={{ color:'#666', fontSize:'8px', letterSpacing:'2px', marginBottom:'4px' }}>{item.label}</div>
                      <div style={{ color:item.col, fontFamily:"'Courier New',monospace", fontSize:'10px' }}>{item.val}</div>
                    </div>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* ══ 05 ATTACKS ══ */}
          <div id="attacks" ref={s5ref}>
            <SectionLabel label="05 / ATTACK VECTORS" color="#ff0000" visible={s5v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'28px', opacity:s5v?1:0, transition:'opacity 0.6s ease 0.2s' }}>How Blockchains<br /><span style={{ color:'#ff0000' }}>Get Attacked</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #ff000022', opacity:s5v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=960&auto=format&fit=crop&q=80" alt="cyber attack" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block', filter:'brightness(0.5) saturate(0.6) hue-rotate(-10deg)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#ff000066', fontSize:'9px', letterSpacing:'2px' }}>ATTACK VECTORS — AND WHY THEY MOSTLY FAIL</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                { icon:'⛏️', name:'51% ATTACK',          color:'#ff6600', severity:'CRITICAL',         desc:'Control >50% of hash power or staked coins. Rewrite recent history, double-spend your own transactions, censor others. Cannot steal others\' funds or create coins from nothing.', defense:'Network decentralization, checkpointing, economic cost of attack' },
                { icon:'✏️', name:'TAMPER ATTACK',        color:'#ff0000', severity:'BLOCKED BY DESIGN', desc:'Modify transaction data in an old block. That block\'s hash changes, breaking every block after it. Every honest node instantly rejects the tampered chain — the math makes it self-evident.', defense:'Cryptographic chaining — built into every block' },
                { icon:'🔁', name:'REPLAY ATTACK',        color:'#ffff00', severity:'MEDIUM',            desc:'After a chain fork, a valid signed transaction on chain A could be rebroadcast on chain B. Digital signatures are tied to specific tx hashes — cross-chain replay fails verification.', defense:'Chain IDs, nonces, EIP-155 replay protection' },
                { icon:'👥', name:'SYBIL ATTACK',         color:'#d800ff', severity:'HIGH',              desc:'Create many fake identities to gain disproportionate influence. In a naive lottery each identity gets one ticket — 10 fakes out of 17 = 59% attack odds. Stake requirements make each fake very expensive.', defense:'Minimum stake requirements, stake-weighted selection' },
                { icon:'💸', name:'DOUBLE SPEND',         color:'#00ffff', severity:'HIGH',              desc:'Broadcast two conflicting transactions spending the same coins. Both propagate, creating a fork. The network keeps the longest chain and orphans the other — erasing the fraudulent transaction.', defense:'Wait for 6+ block confirmations before accepting payment' },
                { icon:'🐛', name:'SMART CONTRACT EXPLOIT',color:'#ff4466', severity:'CRITICAL',         desc:'Bugs in smart contract code can be exploited (e.g. 2016 DAO hack: $60M drained). Unlike software, deployed contracts cannot be patched — the code is immutable on-chain forever.', defense:'Formal verification, security audits, upgrade proxy patterns, time-locks' },
              ].map((atk,i)=>(
                <div key={i} style={{ background:'#080808', border:`1px solid ${atk.color}22`, borderRadius:'8px', padding:'20px 24px', opacity:s5v?1:0, transform:s5v?'translateX(0)':'translateX(20px)', transition:`all 0.5s ease ${i*0.08}s`, borderLeft:`4px solid ${atk.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px', flexWrap:'wrap', gap:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'18px' }}>{atk.icon}</span>
                      <span style={{ color:atk.color, fontWeight:'bold', letterSpacing:'2px', fontSize:'13px' }}>{atk.name}</span>
                    </div>
                    <span style={{ color:atk.color, fontSize:'8px', letterSpacing:'2px', border:`1px solid ${atk.color}33`, padding:'3px 10px', borderRadius:'2px', whiteSpace:'nowrap' }}>{atk.severity}</span>
                  </div>
                  <p style={{ color:'#aaa', fontSize:'1rem', lineHeight:'1.9', margin:'0 0 8px' }}>{atk.desc}</p>
                  <div style={{ color:'#666', fontSize:'10px' }}><span style={{ color:'#00ff00' }}>DEFENSE: </span>{atk.defense}</div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* ══ 06 MERKLE TREE ══ */}
          <div id="data-structures" ref={s6ref}>
            <SectionLabel label="06 / DATA STRUCTURES" color="#ff6600" visible={s6v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'24px', opacity:s6v?1:0, transition:'opacity 0.6s ease 0.2s' }}>The Merkle<br /><span style={{ color:'#ff6600' }}>Tree</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #ff660022', opacity:s6v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=960&auto=format&fit=crop&q=80" alt="data structure" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block', filter:'brightness(0.55) saturate(0.7) hue-rotate(15deg)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#ff660066', fontSize:'9px', letterSpacing:'2px' }}>MERKLE TREE — EFFICIENT PROOF OF INCLUSION</div>
            </div>
            <p style={{ color:'#ccc', lineHeight:'1.95', marginBottom:'28px', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", fontSize:'1.1rem', opacity:s6v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              A Merkle tree hashes all transactions in a block pairwise up to a single root — the Merkle Root stored in the header. Change any transaction and the root changes, invalidating the block. It also enables SPV (Simplified Payment Verification) — lightweight clients can verify a transaction is in a block without downloading the whole thing.
            </p>
            <div style={{ background:'#080808', border:'1px solid #ff660022', borderRadius:'10px', padding:'28px', opacity:s6v?1:0, transition:'opacity 0.6s ease 0.4s' }}>
              <div style={{ color:'#ff660044', fontSize:'10px', letterSpacing:'3px', marginBottom:'24px', textAlign:'center' }}>MERKLE TREE STRUCTURE</div>
              {[
                { level:'MERKLE ROOT', nodes:['Root: 5e3f8a...'], color:'#ff6600', desc:'Stored in block header — any tampered tx changes this' },
                { level:'LEVEL 2', nodes:['Hash(AB): a1b2...','Hash(CD): c3d4...'], color:'#ffaa00', desc:'' },
                { level:'LEVEL 1', nodes:['Hash(A): tx1h...','Hash(B): tx2h...','Hash(C): tx3h...','Hash(D): tx4h...'], color:'#ffdd00', desc:'' },
                { level:'TRANSACTIONS', nodes:['TX A: Alice→Bob','TX B: Bob→Carol','TX C: Carol→Dave','TX D: Dave→Alice'], color:'#888', desc:'Raw transaction data' },
              ].map((row,i)=>(
                <div key={i} style={{ marginBottom:'16px' }}>
                  <div style={{ color:'#999', fontSize:'8px', letterSpacing:'2px', marginBottom:'6px', textAlign:'center' }}>{row.level}</div>
                  <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
                    {row.nodes.map((n,j)=>(
                      <div key={j} style={{ background:'#0a0a0a', border:`1px solid ${row.color}33`, borderRadius:'4px', padding:'7px 12px', color:row.color, fontSize:'9px', fontFamily:"'Courier New',monospace" }}>{n}</div>
                    ))}
                  </div>
                  {row.desc && <div style={{ color:'#333', fontSize:'9px', textAlign:'center', marginTop:'4px' }}>{row.desc}</div>}
                  {i < 3 && <div style={{ textAlign:'center', color:'#444', fontSize:'13px', marginTop:'6px' }}>↑ hash pairs</div>}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* ══ 07 REAL WORLD ══ */}
          <div id="real-world" ref={s7ref}>
            <SectionLabel label="07 / REAL WORLD APPLICATIONS" color="#00ffff" visible={s7v} />
            <h2 style={{ fontSize:'clamp(2.5rem,6vw,4.5rem)', color:'#fff', marginBottom:'24px', opacity:s7v?1:0, transition:'opacity 0.6s ease 0.2s' }}>Beyond<br /><span style={{ color:'#00ffff' }}>Currency</span></h2>
            <div style={{ borderRadius:'10px', overflow:'hidden', marginBottom:'28px', border:'1px solid #00ffff22', opacity:s7v?1:0, transition:'opacity 0.8s ease 0.15s' }}>
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=960&auto=format&fit=crop&q=80" alt="real world applications" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block', filter:'brightness(0.55) saturate(0.75)' }} />
              <div style={{ background:'#050505', padding:'10px 16px', color:'#00ffff66', fontSize:'9px', letterSpacing:'2px' }}>REAL-WORLD IMPACT — REWRITING THE RULES OF TRUST</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'14px', opacity:s7v?1:0, transition:'opacity 0.6s ease 0.3s' }}>
              {[
                { icon:'📜', title:'SMART CONTRACTS',  color:'#00ff00', desc:'Self-executing code on-chain. Run exactly as written with no downtime or censorship. Power DeFi, NFTs, DAOs, and trustless agreements between strangers.' },
                { icon:'🏦', title:'DEFI',             color:'#ffff00', desc:'Lend, borrow, and trade without banks. $100B+ locked in DeFi protocols. Accessible to anyone globally with just a wallet address.' },
                { icon:'🗳️', title:'VOTING',          color:'#00ffff', desc:'Tamper-proof, transparent, auditable elections. Every vote is an on-chain transaction — verifiable by anyone, alterable by no one.' },
                { icon:'📦', title:'SUPPLY CHAIN',     color:'#ff6600', desc:'Track goods from factory to shelf. Every handoff recorded immutably. Eliminates fraud, counterfeiting, and opacity in global trade.' },
                { icon:'🎨', title:'NFTs',             color:'#d800ff', desc:'Non-Fungible Tokens prove digital ownership. The token is an immutable ownership record on-chain — transferable and verifiable without any central platform.' },
                { icon:'🌐', title:'DIGITAL IDENTITY', color:'#ff4466', desc:'Self-sovereign identity — own your credentials without relying on Google or a government database. Verifiable credentials on decentralised networks.' },
              ].map((item,i)=>(
                <div key={i} style={{ background:'#0a0a0a', border:`1px solid ${item.color}22`, borderRadius:'10px', padding:'20px', transition:'all 0.2s', cursor:'default' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=item.color+'55';e.currentTarget.style.background='#111';e.currentTarget.style.boxShadow=`0 0 20px ${item.color}11`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=item.color+'22';e.currentTarget.style.background='#0a0a0a';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{ fontSize:'26px', marginBottom:'10px' }}>{item.icon}</div>
                  <div style={{ color:item.color, fontSize:'10px', fontWeight:'bold', letterSpacing:'2px', marginBottom:'8px' }}>{item.title}</div>
                  <div style={{ color:'#aaa', fontSize:'13px', lineHeight:'1.8' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ borderTop:'1px solid #0d0d0d', padding:'40px 20px', textAlign:'center' }}>
          <div style={{ color:'#00ff00', fontSize:'13px', letterSpacing:'4px', marginBottom:'8px' }}>BLOCKCHAIN_CORE_v3.0</div>
          <div style={{ color:'#222', fontSize:'9px', letterSpacing:'3px' }}>SYSTEM_ID: 2203057 // SECURE_CONNECTION // ALL_HASHES_VERIFIED</div>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        html { scroll-behavior:smooth; }
      `}</style>
    </div>
  );
}