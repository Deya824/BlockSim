import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import sha256 from 'crypto-js/sha256';
import Block from './Block';
import MatrixRain from './MatrixRain';
import KeyVault from './KeyVault';
import './index.css';

function Simulator() {
  const navigate  = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [blocks, setBlocks] = useState([{
    index: 1,
    hash: "00ae5fb007821c281ab4d80f8562d801884378650176909c413a2c398c8e6e01",
    previousHash: "0", nonce: 200,
    sender: "SYSTEM", receiver: "USER_A", amount: 10,
    createdWith: "POW",
  }]);

  const [consensus,    setConsensus]   = useState("POW");
  const [logs,         setLogs]        = useState([]);
  const [isSyncing,    setIsSyncing]   = useState(false);
  const [showKeyVault, setShowKeyVault] = useState(false);

  // ── GLOBAL WALLET (generated once, reused for all blocks) ──
  const [wallet, setWallet] = useState(null); // { privateKey, publicKey }

  // ── ADD BLOCK MODAL ──
  // step: 'form' → 'sign' → done
  const [showModal,  setShowModal]  = useState(false);
  const [modalStep,  setModalStep]  = useState('form'); // 'form' | 'sign'
  const [formData,   setFormData]   = useState({ sender: "USER_A", receiver: "USER_B", amount: "" });
  const [txHash,     setTxHash]     = useState('');   // sha256 of the form data
  const [txSig,      setTxSig]      = useState('');   // sha256(txHash + privateKey)
  const [sigStatus,  setSigStatus]  = useState(null); // null | 'signing' | 'done'

  const terminalEndRef = useRef(null);

  // ── helpers ──
  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time: timestamp, msg: message, type }]);
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  const playSuccess = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  // ── cloud load / save ──
  useEffect(() => {
    const loadData = async () => {
      if (!userEmail) return;
      addLog("CONTACTING MONGODB CLOUD...", "info");
      try {
        const res  = await fetch(`http://127.0.0.1:5000/load/${userEmail}`);
        const data = await res.json();
        if (data.success && data.blockchain?.length > 0) {
          setBlocks(data.blockchain);
          addLog("REMOTE DATA SYNCED SUCCESSFULLY.", "success");
        } else {
          addLog("NO PREVIOUS DATA FOUND. GENESIS INITIALIZED.", "warn");
        }
      } catch { addLog("CONNECTION TO BACKEND FAILED.", "error"); }
    };
    loadData();
  }, [userEmail]);

  const saveToCloud = async () => {
    setIsSyncing(true);
    addLog("INITIATING DATA UPLOAD...", "info");
    try {
      const res  = await fetch('http://127.0.0.1:5000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, blockchain: blocks }),
      });
      const data = await res.json();
      if (data.success) { addLog("BLOCKCHAIN SECURED IN MONGODB.", "success"); playClickSound(); }
    } catch { addLog("UPLOAD FAILED.", "error"); }
    setIsSyncing(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    addLog("TERMINATING SESSION...", "warn");
    setTimeout(() => navigate('/login'), 1000);
  };

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  useEffect(() => { addLog(`USER_SESSION: ${userEmail}`, "info"); addLog("SYSTEM INITIALIZED...", "info"); }, []);

  // ── block update ──
  const updateBlock = (index, updatedFields) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb[index - 1] = { ...nb[index - 1], ...updatedFields };
      if (index < nb.length) nb[index].previousHash = updatedFields.hash;
      return nb;
    });
  };

  const removeBlock = () => {
    if (blocks.length > 1) setBlocks(prev => prev.slice(0, -1));
  };

  // ── OPEN MODAL ──
  const openAddModal = () => {
    if (!wallet) {
      addLog("⚠️ NO WALLET FOUND — open KEY_VAULT to generate one first!", "error");
      setShowKeyVault(true);
      return;
    }
    setFormData({ sender: "USER_A", receiver: "USER_B", amount: (blocks.length + 1) * 10 });
    setTxHash('');
    setTxSig('');
    setSigStatus(null);
    setModalStep('form');
    setShowModal(true);
  };

  // ── STEP 1 → STEP 2: compute tx hash, move to sign screen ──
  // CRITICAL: amount must be Number() here — same type used in deployBlock and
  // Block.jsx's currentTxHash — otherwise the hashes won't match after save/load.
  const goToSignStep = () => {
    const numAmount = Number(formData.amount);
    const data      = JSON.stringify({ sender: formData.sender, receiver: formData.receiver, amount: numAmount });
    const theHash   = sha256(data).toString();
    setTxHash(theHash);
    setTxSig('');
    setSigStatus(null);
    setModalStep('sign');
  };

  // ── SIGN: simulate ECDSA — sig = sha256(txHash + privateKey) ──
  const signTransaction = () => {
    setSigStatus('signing');
    setTimeout(() => {
      const sig = sha256(txHash + wallet.privateKey).toString();
      setTxSig(sig);
      setSigStatus('done');
      playSuccess();
      addLog(`TX SIGNED — sig: ${sig.substring(0, 12)}...`, "success");
    }, 900);
  };

  // ── DEPLOY: add block with signature + publicKey + originalTxHash embedded ──
  const deployBlock = () => {
    const lastBlock = blocks[blocks.length - 1];
    // Store amount as Number AND save the originalTxHash computed at sign time.
    // This hash is the ground truth for tamper detection — storing it avoids
    // false-positive "tampered" alerts caused by string/number type differences
    // after a MongoDB save/load round-trip.
    const numAmount     = Number(formData.amount);
    const origTxHash    = sha256(JSON.stringify({ sender: formData.sender, receiver: formData.receiver, amount: numAmount })).toString();
    const newBlock      = {
      index:           blocks.length + 1,
      hash:            "",
      previousHash:    lastBlock.hash,
      nonce:           0,
      sender:          formData.sender,
      receiver:        formData.receiver,
      amount:          numAmount,
      txSignature:     txSig,
      signerPubKey:    wallet.publicKey,
      originalTxHash:  origTxHash,
      createdWith:     consensus, // ← persisted so Block never needs to recompute it
    };
    setBlocks(prev => [...prev, newBlock]);
    addLog(`BLOCK #${blocks.length + 1} DEPLOYED — signed by ${wallet.publicKey.substring(0, 10)}...`, "success");
    setShowModal(false);
  };

  // ── COLORS ──
  const accentColor = consensus === 'POS' ? '#d800ff' : '#00ff00';
  const cyan        = '#00ffff';
  const orange      = '#ff6600';

  const inputStyle = {
    width: '100%', background: 'black', border: `1px solid ${accentColor}`,
    color: accentColor, fontFamily: 'monospace', fontSize: '13px',
    padding: '8px 10px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    color: accentColor, fontFamily: 'monospace', fontSize: '11px',
    letterSpacing: '1px', marginBottom: '4px', display: 'block', opacity: 0.8,
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <MatrixRain />
      <div className="crt-overlay"></div>
      <div className="crt-scanline"></div>

      {/* TOP NAV */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ background: 'black', border: '1px solid #00ff00', color: '#00ff00', padding: '8px 15px', cursor: 'pointer', fontFamily: 'monospace' }}>&lt;&lt; DASHBOARD</button>
        <button onClick={handleLogout}        style={{ background: 'black', border: '1px solid #ff0000', color: '#ff0000', padding: '8px 15px', cursor: 'pointer', fontFamily: 'monospace' }}>LOGOUT</button>
      </div>

      {/* HEADER */}
      <div style={{ textAlign: 'center', padding: '60px 20px 20px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ color: '#00ff00', fontSize: '28px', margin: '0 0 15px', textShadow: '0 0 10px #00ff00', fontFamily: 'monospace' }}>&gt;_ BLOCKCHAIN_CORE_v3.0</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* CONSENSUS */}
          <div style={{ border: '1px solid #00ff00', padding: '2px', background: 'black', display: 'flex' }}>
            <button onClick={() => { setConsensus("POW"); addLog("MODE: POW", "info"); }} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'monospace', background: consensus === "POW" ? '#00ff00' : 'black', color: consensus === "POW" ? 'black' : '#00ff00' }}>MINING</button>
            <button onClick={() => { setConsensus("POS"); addLog("MODE: POS", "info"); }} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'monospace', background: consensus === "POS" ? '#d800ff' : 'black', color: consensus === "POS" ? 'black' : '#d800ff' }}>STAKING</button>
          </div>

          {/* SYNC */}
          <button onClick={saveToCloud} disabled={isSyncing} style={{ padding: '10px 20px', border: '1px solid cyan', background: 'rgba(0,255,255,0.1)', color: 'cyan', cursor: 'pointer', fontFamily: 'monospace' }}>
            {isSyncing ? "SYNCING..." : "[ SYNC_TO_CLOUD ]"}
          </button>

          {/* KEY VAULT — shows wallet status */}
          <button
            onClick={() => { setShowKeyVault(true); addLog("KEY_VAULT OPENED", "info"); }}
            style={{ padding: '10px 20px', border: `1px solid ${cyan}`, background: wallet ? `${cyan}22` : 'black', color: cyan, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '1px', position: 'relative' }}
          >
            {wallet ? '🔐 WALLET: ACTIVE' : '🔐 KEY_VAULT'}
            {!wallet && (
              <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff0000', borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>!</span>
            )}
          </button>
        </div>

        {/* WALLET STATUS BAR */}
        {!wallet && (
          <div style={{ marginTop: '10px', color: '#ff6600', fontSize: '11px', fontFamily: 'monospace', opacity: 0.8 }}>
            ⚠️ No wallet detected — you must generate a wallet before adding blocks
          </div>
        )}
        {wallet && (
          <div style={{ marginTop: '10px', color: cyan, fontSize: '10px', fontFamily: 'monospace', opacity: 0.6 }}>
            SIGNER: {wallet.publicKey.substring(0, 20)}...
          </div>
        )}
      </div>

      {/* CHAIN */}
      <div className="chain-container" style={{ display: 'flex', alignItems: 'center', padding: '20px', overflowX: 'auto', minHeight: '400px', paddingBottom: '180px' }}>
        {blocks.map(block => (
          <Block
            key={block.index}
            {...block}
            onUpdate={updateBlock}
            consensus={consensus}
            addLog={addLog}
          />
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginLeft: '50px' }}>
          <button
            onClick={openAddModal}
            title={!wallet ? "Generate a wallet first!" : "Add new block"}
            style={{ height: '60px', width: '60px', fontSize: '30px', background: 'black', border: `2px dashed ${wallet ? '#00ff00' : '#ff6600'}`, color: wallet ? '#00ff00' : '#ff6600', cursor: 'pointer', borderRadius: '50%' }}
          >+</button>
          {blocks.length > 1 && (
            <button onClick={removeBlock} style={{ height: '40px', width: '40px', fontSize: '20px', background: 'black', border: '2px dashed #ff0000', color: '#ff0000', cursor: 'pointer', borderRadius: '50%' }}>x</button>
          )}
        </div>
      </div>

      {/* TERMINAL */}
      <div className="terminal-container">
        {logs.map((log, i) => (
          <div key={i} className="terminal-line">
            <span style={{ color: '#555' }}>[{log.time}]</span>{' '}
            <span className={`log-${log.type}`}>&gt;&gt; {log.msg}</span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* ═══════════════════════════════════════
          ADD BLOCK MODAL — 2 steps
          STEP 1: form  |  STEP 2: sign
      ═══════════════════════════════════════ */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#000', border: `1px solid ${accentColor}`, boxShadow: `0 0 30px ${accentColor}66`, borderRadius: '6px', padding: '28px 32px', width: '340px', fontFamily: 'monospace', animation: 'fadeInScale 0.15s ease' }}>

            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${accentColor}33`, paddingBottom: '12px', marginBottom: '18px' }}>
              <div style={{ color: accentColor, fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px' }}>
                {modalStep === 'form' ? '📝 NEW_BLOCK' : '✍️ SIGN_TX'}
              </div>
              {/* STEP INDICATOR */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {['form', 'sign'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1px solid ${modalStep === s ? accentColor : '#333'}`, background: modalStep === s ? accentColor : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: modalStep === s ? 'black' : '#333' }}>{i + 1}</div>
                    {i === 0 && <div style={{ width: '20px', height: '1px', background: modalStep === 'sign' ? accentColor : '#333' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ color: '#444', fontSize: '10px', marginBottom: '16px' }}>
              BLOCK #{blocks.length + 1} — MODE: {consensus}
            </div>

            {/* ── STEP 1: FORM ── */}
            {modalStep === 'form' && (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>👤 FROM</label>
                  <input style={inputStyle} value={formData.sender} onChange={e => setFormData(p => ({ ...p, sender: e.target.value }))} placeholder="Sender" />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>🏦 TO</label>
                  <input style={inputStyle} value={formData.receiver} onChange={e => setFormData(p => ({ ...p, receiver: e.target.value }))} placeholder="Receiver" />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>₿ AMOUNT</label>
                  <input type="number" style={inputStyle} value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0" min="0" />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'black', border: '1px solid #ff0000', color: '#ff0000', fontFamily: 'monospace', cursor: 'pointer' }}>CANCEL</button>
                  <button
                    onClick={goToSignStep}
                    disabled={!formData.sender || !formData.receiver || formData.amount === ""}
                    style={{ flex: 1, padding: '10px', background: accentColor, border: `1px solid ${accentColor}`, color: 'black', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', opacity: (!formData.sender || !formData.receiver || formData.amount === "") ? 0.4 : 1 }}
                  >
                    NEXT: SIGN ➔
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: SIGN ── */}
            {modalStep === 'sign' && (
              <>
                {/* UNIQUE SIGNATURE EXPLAINER */}
                <div style={{ background: '#0a0500', border: `1px solid ${orange}44`, borderRadius: '4px', padding: '10px', marginBottom: '14px', fontSize: '10px', lineHeight: '1.7' }}>
                  🔑 <span style={{ color: orange }}>Same wallet, unique signature.</span><br/>
                  <span style={{ color: '#664400' }}>Each block gets its own signature computed from <em style={{ color: '#aaa' }}>its own data</em>. Change even one character and the signature is completely different.</span>
                </div>

                {/* VISUAL FLOW: DATA → HASH → SIG */}
                <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '12px', marginBottom: '14px' }}>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#444', fontSize: '9px', letterSpacing: '1px', marginBottom: '3px' }}>① TX DATA — block #{blocks.length + 1} only</div>
                    <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '3px', padding: '6px 8px', fontSize: '9px', fontFamily: 'monospace', color: '#aaa' }}>
                      {`{ from: "${formData.sender}", to: "${formData.receiver}", amount: ${formData.amount} }`}
                    </div>
                  </div>

                  <div style={{ color: '#333', fontSize: '10px', textAlign: 'center', marginBottom: '6px' }}>⬇ sha256()</div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ color: '#444', fontSize: '9px', letterSpacing: '1px', marginBottom: '3px' }}>② TX HASH — unique fingerprint of this block</div>
                    <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '3px', padding: '6px 8px', fontSize: '9px', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: '1.5' }}>
                      <span style={{ color: cyan }}>{txHash.substring(0, 16)}</span>
                      <span style={{ color: '#222' }}>{txHash.substring(16)}</span>
                    </div>
                  </div>

                  <div style={{ color: '#333', fontSize: '10px', textAlign: 'center', marginBottom: '6px' }}>⬇ sha256( txHash + <span style={{ color: orange }}>privateKey</span> )</div>

                  <div>
                    <div style={{ color: '#444', fontSize: '9px', letterSpacing: '1px', marginBottom: '3px' }}>③ SIGNATURE — only your private key produces this</div>
                    {!txSig ? (
                      <div style={{ background: '#0a0a0a', border: '1px solid #111', borderRadius: '3px', padding: '6px 8px', fontSize: '9px', fontFamily: 'monospace', color: sigStatus === 'signing' ? orange : '#222', fontStyle: 'italic' }}>
                        {sigStatus === 'signing' ? '⟳ computing signature...' : '— click SIGN to generate —'}
                      </div>
                    ) : (
                      <div style={{ background: '#001a00', border: '1px solid #00ff0033', borderRadius: '3px', padding: '6px 8px', fontSize: '9px', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: '1.5' }}>
                        <span style={{ color: '#00ff00' }}>{txSig.substring(0, 16)}</span>
                        <span style={{ color: '#003300' }}>{txSig.substring(16)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WALLET ROW */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '8px 10px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '3px' }}>
                  <span style={{ fontSize: '14px' }}>🔐</span>
                  <div style={{ fontSize: '10px' }}>
                    <div style={{ color: '#444', marginBottom: '2px' }}>SIGNING WALLET (reused key, fresh sig per block)</div>
                    <div style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: '9px' }}>{wallet?.publicKey.substring(0, 28)}...</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setModalStep('form')} style={{ flex: 1, padding: '10px', background: 'black', border: '1px solid #333', color: '#555', fontFamily: 'monospace', cursor: 'pointer' }}>← BACK</button>
                  {!txSig ? (
                    <button onClick={signTransaction} disabled={sigStatus === 'signing'}
                      style={{ flex: 2, padding: '10px', background: sigStatus === 'signing' ? '#111' : orange, border: `1px solid ${orange}`, color: sigStatus === 'signing' ? '#333' : 'black', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}>
                      {sigStatus === 'signing' ? '⟳ SIGNING...' : '🔑 SIGN WITH PRIVATE KEY'}
                    </button>
                  ) : (
                    <button onClick={deployBlock}
                      style={{ flex: 2, padding: '10px', background: '#00ff00', border: '1px solid #00ff00', color: 'black', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}>
                      🚀 DEPLOY BLOCK
                    </button>
                  )}
                </div>

                <div style={{ color: '#333', fontSize: '10px', marginTop: '12px', lineHeight: '1.7', borderTop: '1px solid #111', paddingTop: '10px' }}>
                  {!txSig
                    ? <>Block #{blocks.length + 1} needs its own signature. The <span style={{ color: orange }}>same private key</span> produces a <span style={{ color: orange }}>completely different result</span> here than on any other block — because the tx data is different.</>
                    : <>✅ Block #{blocks.length + 1} signed. <span style={{ color: '#00ff00' }}>Any node</span> can verify this with your public key — without ever knowing your private key.</>
                  }
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* KEY VAULT PANEL */}
      {showKeyVault && (
        <>
          <div onClick={() => setShowKeyVault(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <KeyVault
            onClose={() => { setShowKeyVault(false); addLog("KEY_VAULT CLOSED", "info"); }}
            onWalletGenerated={(w) => { setWallet(w); addLog(`WALLET GENERATED — pubkey: ${w.publicKey.substring(0, 12)}...`, "success"); }}
            wallet={wallet}
          />
        </>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Simulator;
