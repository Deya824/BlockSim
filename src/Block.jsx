import React, { useState, useEffect, useRef } from 'react';
import sha256 from 'crypto-js/sha256';
import Transaction from './Transaction';
import './index.css';

function Block({
  index, previousHash, onUpdate, consensus, addLog,
  hash: savedHash, nonce: savedNonce,
  sender: savedSender, receiver: savedReceiver, amount: savedAmount,
  signature: savedSignature,
  txSignature:    savedTxSignature,
  signerPubKey:   savedSignerPubKey,
  originalTxHash: savedOriginalTxHash,
  validator:      savedValidator,
  stake:          savedStake,
  createdWith:    savedCreatedWith,
  friendSigned:   savedFriendSigned,
}) {
  const [nonce,     setNonce]     = useState(savedNonce     || 0);
  const [sender,    setSender]    = useState(savedSender    || (index === 1 ? 'SYSTEM' : 'USER_A'));
  const [receiver,  setReceiver]  = useState(savedReceiver || (index === 1 ? 'USER_A' : 'USER_B'));
  const [amount,    setAmount]    = useState(Number(savedAmount) || index * 10);
  const [hash,      setHash]      = useState(savedHash     || '');
  const [signature, setSignature] = useState(savedSignature || '');
  const [txSignature,  setTxSignature]  = useState(savedTxSignature  || '');
  const [signerPubKey, setSignerPubKey] = useState(savedSignerPubKey || '');
  const [validator,     setValidator]     = useState(savedValidator || 'Validator_01');
  const [stake,         setStake]         = useState(Number(savedStake) || 16);
  const [isSelecting,   setIsSelecting]   = useState(false);
  const [hasWonLottery, setHasWonLottery] = useState(savedSignature ? true : false);
  const [friendSigned,  setFriendSigned]  = useState(!!savedFriendSigned);
  const [isMining,      setIsMining]      = useState(false);
  const [isSlashed,     setIsSlashed]     = useState(false);
  const [validatorReward, setValidatorReward] = useState(null);
  const [stakeEntered,  setStakeEntered]  = useState(!!savedStake && Number(savedStake) > 0);
  const [stakeInput,    setStakeInput]    = useState(Number(savedStake) || '');
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [lotteryModalWinner, setLotteryModalWinner] = useState(null);

  // POW RACE STATE
  const [showMiningRace, setShowMiningRace] = useState(false);
  const [racerNonces,    setRacerNonces]    = useState({});
  const [racerHashes,    setRacerHashes]    = useState({});
  const [raceWinner,     setRaceWinner]     = useState(null);
  const [raceFinished,   setRaceFinished]   = useState(false);

  const raceIntervalRef     = useRef(null);
  const miningIntervalRef   = useRef(null);
  const miningOscRef        = useRef(null);
  const wasValidRef         = useRef(!!savedSignature);
  const prevPreviousHashRef = useRef(previousHash);
  const tamperedRef         = useRef(false);
  const prevConsensusRef    = useRef(consensus);
  const prevTxTamperedRef   = useRef(false);
  const isMounted           = useRef(false);

  const FRIEND_LIST = [
    { name: 'Monica',   emoji: '👩‍🍳' },
    { name: 'Joey',     emoji: '🎭' },
    { name: 'Rachel',   emoji: '👗' },
    { name: 'Ross',     emoji: '🦕' },
    { name: 'Chandler', emoji: '💼' },
    { name: 'Phoebe',   emoji: '🎸' },
  ].map(f => {
    const privateKey = sha256(f.name + '__PRIVATE__').toString();
    const publicKey  = sha256(privateKey + '__PUBLIC__').toString();
    return { ...f, privateKey, publicKey };
  });
  const ALL_RACERS = [{ name: 'YOU', emoji: '🧑‍💻' }, ...FRIEND_LIST];

  const calcReward   = (s) => (0.05 * (s / 32)).toFixed(4);
  const GENESIS_HASH = '00ae5fb007821c281ab4d80f8562d801884378650176909c413a2c398c8e6e01';
  const blockMode    = savedCreatedWith || consensus;

  const getRestoredWinner = () => {
    if (!savedSignature || !savedValidator) return null;
    const s = Number(savedStake) || 16;
    if (savedValidator === 'YOU') return { name: 'YOU', stake: s, isYou: true, emoji: '🧑‍💻', reward: calcReward(s) };
    const EMOJIS = { Monica:'👩‍🍳', Joey:'🎭', Rachel:'👗', Ross:'🦕', Chandler:'💼', Phoebe:'🎸' };
    const pk = sha256(sha256(savedValidator + '__PRIVATE__').toString() + '__PUBLIC__').toString();
    return { name: savedValidator, stake: s, isYou: false, emoji: EMOJIS[savedValidator] || '🔑', publicKey: pk, reward: calcReward(s) };
  };
  const [lotteryWinner, setLotteryWinner] = useState(getRestoredWinner);
  const [scanText, setScanText] = useState('SCANNING VALIDATORS...');

  const originalTxHash = savedOriginalTxHash || '';
  const currentTxHash  = sha256(JSON.stringify({ sender, receiver, amount: Number(amount) })).toString();
  const txTampered     = !!txSignature && !!originalTxHash && currentTxHash !== originalTxHash;

  const speak = (t) => { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(t)); };

  const startMiningSound = () => {
    if (miningOscRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      miningOscRef.current = osc;
      miningOscRef.current.audioCtx = ctx;
    } catch(e) {}
  };

  const stopMiningSound = () => {
    if (miningOscRef.current) {
      try { miningOscRef.current.stop(); miningOscRef.current.audioCtx.close(); } catch(e) {}
      miningOscRef.current = null;
    }
  };

  const playSuccess = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  // ── HASHING ──
  useEffect(() => {
    if (!isMining && !isSelecting && !showMiningRace) {
      const txData  = JSON.stringify({ sender, receiver, amount });
      const posMode = hasWonLottery || (blockMode === 'POS' && !hash.startsWith('00'));
      const text    = index + previousHash + txData + nonce + (posMode ? validator + stake : '');
      const newHash = sha256(text).toString();
      if (newHash !== hash) {
        setHash(newHash);
        if (!(index === 1 && newHash === GENESIS_HASH) && newHash !== savedHash) {
          onUpdate(index, { hash: newHash, nonce, sender, receiver, amount, signature, txSignature, signerPubKey, originalTxHash: savedOriginalTxHash, validator, stake, createdWith: savedCreatedWith, friendSigned });
        }
      }
    }
  }, [sender, receiver, amount, previousHash, index, nonce, consensus, hasWonLottery, stake]);

  // ── TAMPER DETECTION FOR FRIEND SIGNED BLOCKS ──
  useEffect(() => {
    if (!isMounted.current) return;
    if (previousHash !== prevPreviousHashRef.current) {
      if (friendSigned) tamperedRef.current = true;
    }
    prevPreviousHashRef.current = previousHash;
  }, [previousHash]);

  const isPowValid = hash.startsWith('00');
  const isPosValid = signature !== '' && (
    friendSigned ? !tamperedRef.current : hash === signature
  );
  const isValid = (index === 1 && hash === GENESIS_HASH) || isPowValid || isPosValid;

  // ── MOUNT TIMER ──
  useEffect(() => {
    const t = setTimeout(() => { isMounted.current = true; }, 2000);
    return () => clearTimeout(t);
  }, []);

  // ── SECURITY MONITOR ──
  useEffect(() => {
    const modeChanged = prevConsensusRef.current !== consensus;
    if (isMounted.current && !modeChanged && wasValidRef.current && !isValid && !isMining && !isSelecting) {
      if (addLog) addLog(`SECURITY ALERT: BLOCK #${index} TAMPERED!`, 'error');
      speak('Security Breach Detected.');
      if (friendSigned && validator && validator !== 'YOU') {
        setIsSlashed(true);
        speak(`${validator} has been slashed.`);
        if (addLog) addLog(`⚡ SLASHING: ${validator} lost staked ETH!`, 'error');
      }
    }
    if (!wasValidRef.current && isValid) setIsSlashed(false);
    wasValidRef.current      = isValid;
    prevConsensusRef.current = consensus;
  }, [isValid, consensus, isMining, isSelecting, index, addLog, friendSigned, validator]);

  useEffect(() => {
    if (isMounted.current && txTampered && !prevTxTamperedRef.current) {
      if (addLog) addLog(`⚠️ BLOCK #${index}: TX SIGNATURE BROKEN!`, 'error');
      speak('Transaction signature compromised.');
    }
    prevTxTamperedRef.current = txTampered;
  }, [txTampered]);

  // ── POW MINING RACE ──
  const startMiningRace = () => {
    const txData = JSON.stringify({ sender, receiver, amount });
    const initN = {}; const initH = {};
    ALL_RACERS.forEach(r => { initN[r.name] = 0; initH[r.name] = '????????????????????????????????????????????????????????????????'; });
    setRacerNonces(initN); setRacerHashes(initH);
    setRaceWinner(null); setRaceFinished(false);
    setShowMiningRace(true); setIsMining(true);
    startMiningSound();

    const youWin     = Math.random() < 0.30;
    const winnerName = youWin ? 'YOU' : FRIEND_LIST[Math.floor(Math.random() * FRIEND_LIST.length)].name;
    const speeds     = {};
    ALL_RACERS.forEach(r => { speeds[r.name] = Math.floor(Math.random() * 60) + 40; });
    const winnerTick = Math.floor(Math.random() * 16) + 45;
    let tick = 0;

    raceIntervalRef.current = setInterval(() => {
      tick++;
      setRacerNonces(prev => {
        const n = { ...prev };
        ALL_RACERS.forEach(r => { n[r.name] = prev[r.name] + speeds[r.name] + Math.floor(Math.random() * 20); });
        return n;
      });
      setRacerHashes(prev => {
        const n = { ...prev };
        ALL_RACERS.forEach(r => { n[r.name] = sha256(r.name + index + speeds[r.name] * tick + Math.floor(Math.random() * 50) + txData).toString(); });
        return n;
      });

      if (tick >= winnerTick) {
        clearInterval(raceIntervalRef.current);
        stopMiningSound();
        let winNonce = 0, winHash = '';
        for (let n = 1; n < 200000; n++) {
          const h = sha256(index + previousHash + txData + n).toString();
          if (h.startsWith('00')) { winNonce = n; winHash = h; break; }
        }
        const wf     = FRIEND_LIST.find(f => f.name === winnerName);
        const winner = { name: winnerName, emoji: winnerName === 'YOU' ? '🧑‍💻' : wf?.emoji, nonce: winNonce, hash: winHash, isYou: winnerName === 'YOU', publicKey: wf?.publicKey || null };
        setRacerHashes(prev => ({ ...prev, [winnerName]: winHash }));
        setRacerNonces(prev => ({ ...prev, [winnerName]: winNonce }));
        setRaceWinner(winner); setRaceFinished(true); setIsMining(false);
        playSuccess();

        if (winnerName === 'YOU') {
          speak('You won the mining race! Confirm to add the block.');
          if (addLog) addLog(`⛏️ BLOCK #${index}: YOU won! Click confirm.`, 'success');
        } else {
          speak(`${winnerName} won the mining race.`);
          if (addLog) addLog(`⛏️ BLOCK #${index}: ${wf?.emoji} ${winnerName} won — auto-adding!`, 'success');
          setTimeout(() => {
            setNonce(winNonce); setHash(winHash);
            setShowMiningRace(false); setRaceFinished(false);
            onUpdate(index, { hash: winHash, nonce: winNonce, sender, receiver, amount, signature: '', txSignature, signerPubKey, originalTxHash: savedOriginalTxHash, validator: winnerName, stake, createdWith: savedCreatedWith, friendSigned: false });
            if (addLog) addLog(`✅ BLOCK #${index}: Added by ${wf?.emoji} ${winnerName}`, 'success');
          }, 1500);
        }
      }
    }, 50);
  };

  const confirmYouWon = () => {
    if (!raceWinner?.isYou) return;
    setNonce(raceWinner.nonce); setHash(raceWinner.hash);
    setShowMiningRace(false); setRaceFinished(false);
    onUpdate(index, { hash: raceWinner.hash, nonce: raceWinner.nonce, sender, receiver, amount, signature: '', txSignature, signerPubKey, originalTxHash: savedOriginalTxHash, validator, stake, createdWith: savedCreatedWith, friendSigned: false });
    speak('Block confirmed and added to chain.');
    if (addLog) addLog(`✅ BLOCK #${index}: YOU confirmed — added to chain!`, 'success');
  };

  // ── POS LOTTERY ──
  const runValidatorLottery = () => {
    setIsSelecting(true); startMiningSound(); setScanText('SCANNING VALIDATORS...');
    setLotteryModalWinner(null);
    const msgs = ['SCANNING VALIDATORS...', 'CHECKING STAKES...', 'RUNNING LOTTERY...', 'SELECTING WINNER...'];
    let mi = 0;
    const si = setInterval(() => { mi = (mi + 1) % msgs.length; setScanText(msgs[mi]); }, 350);

    setTimeout(() => {
      clearInterval(si); stopMiningSound();
      const ys     = stake;
      const youWin = Math.random() < 0.30;

      if (youWin) {
        setValidator('YOU'); setHasWonLottery(true);
        setLotteryWinner({ name: 'YOU', stake: ys, isYou: true, emoji: '🧑‍💻' });
        setLotteryModalWinner({ name: 'YOU', emoji: '🧑‍💻', stake: ys, isYou: true });
        speak('You won the validator lottery!');
        if (addLog) addLog(`🎰 BLOCK #${index}: YOU won the lottery`, 'success');
        setTimeout(() => { setIsSelecting(false); setLotteryModalWinner(null); }, 2500);
      } else {
        const fr     = FRIEND_LIST.map(f => ({ ...f, stake: ys + Math.floor(Math.random() * 30) + 1 }));
        const friend = fr.reduce((b, f) => f.stake > b.stake ? f : b);
        if (addLog) addLog(`🎲 LOTTERY: ${friend.emoji} ${friend.name} highest at ${friend.stake}Ξ`, 'info');
        setValidator(friend.name); setStake(friend.stake);
        setLotteryWinner({ ...friend, isYou: false });
        setLotteryModalWinner({ name: friend.name, emoji: friend.emoji, stake: friend.stake, isYou: false });
        speak(`${friend.name} won the validator lottery!`);
        setTimeout(() => {
          setIsSelecting(false); setLotteryModalWinner(null);
          const sig    = sha256(hash + friend.privateKey).toString();
          const reward = calcReward(friend.stake);
          setSignature(sig); setFriendSigned(true); setValidatorReward(reward);
          setLotteryWinner(prev => ({ ...prev, publicKey: friend.publicKey, reward }));
          onUpdate(index, { hash, nonce, sender, receiver, amount, signature: sig, txSignature, signerPubKey, originalTxHash: savedOriginalTxHash, validator: friend.name, stake: friend.stake, createdWith: savedCreatedWith, friendSigned: true, validatorPubKey: friend.publicKey });
          playSuccess();
          speak(`${friend.name} signed the block.`);
          if (addLog) addLog(`🎰 BLOCK #${index}: ${friend.emoji} ${friend.name} signed — reward: ${reward} ETH`, 'info');
        }, 2500);
      }
    }, 2000);
  };

  const signBlock = () => {
    const reward = calcReward(stake);
    setSignature(hash); setValidatorReward(reward);
    setLotteryWinner(prev => prev ? { ...prev, reward } : { name: 'YOU', stake, isYou: true, emoji: '🧑‍💻', reward });
    playSuccess(); speak('Proof of Stake Secured.');
    onUpdate(index, { hash, nonce, sender, receiver, amount, signature: hash, txSignature, signerPubKey, originalTxHash: savedOriginalTxHash, validator, stake, createdWith: savedCreatedWith, friendSigned: false });
  };

  useEffect(() => {
    return () => {
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
      if (raceIntervalRef.current)   clearInterval(raceIntervalRef.current);
      stopMiningSound();
    };
  }, []);

  const cubeClass = `cube ${!isValid ? 'invalid' : isPosValid ? 'pos' : 'valid'}`;
  const neonColor = !isValid ? '#ff0000' : isPosValid ? '#d800ff' : '#00ff00';
  const cyan      = '#00ffff';

  return (
    <div className="cube-wrapper">
      <div className={cubeClass}>
        <div className="face face-top" />
        <div className="face face-side" />
        <div className="face face-front">

          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: `1px solid ${neonColor}`, paddingBottom: '5px' }}>
            <h2 className={!isValid ? 'glitch-text' : ''} style={{ margin: 0, fontSize: '18px', color: neonColor }}>
              {isValid ? `BLOCK_0${index}` : '⚠️ TAMPERED'}
            </h2>
            <span style={{ fontSize: '18px', color: blockMode === 'POS' ? '#d800ff' : '#00ff00' }}>{blockMode}</span>
          </div>

          {/* TRANSACTION */}
          <div className="glass-panel" style={{ borderColor: neonColor }}>
            <Transaction sender={sender} setSender={setSender} receiver={receiver} setReceiver={setReceiver} amount={amount} setAmount={setAmount} consensus={blockMode} />
          </div>

          {/* TX SIGNATURE */}
          {txSignature && (
            <div style={{ marginTop: '7px', padding: '6px 8px', borderRadius: '3px', fontSize: '9px', fontFamily: 'monospace', background: txTampered ? '#1a0000' : '#00001a', border: `1px solid ${txTampered ? '#ff000066' : `${cyan}44`}` }}>
              <div style={{ color: txTampered ? '#ff0000' : cyan, marginBottom: '3px', letterSpacing: '1px', fontWeight: 'bold' }}>{txTampered ? '❌ SIGNATURE BROKEN' : '✅ TX SIGNED'}</div>
              <div style={{ color: txTampered ? '#440000' : '#003333', wordBreak: 'break-all', lineHeight: '1.5' }}>SIG: {txSignature.substring(0, 16)}...</div>
              <div style={{ color: txTampered ? '#440000' : '#003333', wordBreak: 'break-all', lineHeight: '1.5' }}>BY:  {signerPubKey.substring(0, 16)}...</div>
              {txTampered && <div style={{ color: '#ff0000', marginTop: '4px', fontSize: '8px', letterSpacing: '1px' }}>TX DATA MODIFIED AFTER SIGNING — NETWORK WOULD REJECT THIS</div>}
            </div>
          )}

          <div style={{ marginTop: '10px', color: neonColor, fontSize: '10px' }}>
            <div className="data-row">PREV: {previousHash ? previousHash.substring(0, 8) : '0000'}...</div>
            <div className="data-row" style={{ color: isValid ? neonColor : 'red' }}>HASH: {hash.substring(0, 12)}...</div>

            {/* ── POW ── */}
            {!isPosValid && blockMode === 'POW' && (
              <div style={{ marginTop: '10px' }}>
                <span>NONCE: {nonce}</span>
                <button onClick={startMiningRace} disabled={isValid || isMining} className="cube-btn"
                  style={{ borderColor: neonColor, color: isValid ? 'black' : neonColor, background: isValid ? neonColor : 'black', marginTop: '6px' }}>
                  {isValid ? 'SECURE' : isMining ? 'RACING...' : 'MINE BLOCK'}
                </button>
              </div>
            )}

            {/* ── POS ── */}
            {!isPowValid && blockMode === 'POS' && (
              <div style={{ marginTop: '5px' }}>
                {!signature && !isSelecting && !lotteryWinner && (
                  <div>
                    {!stakeEntered && !showStakeForm && (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: '8px', color: '#555', marginBottom: '8px', letterSpacing: '1px' }}>BLOCK DEPLOYED — STAKE ETH TO JOIN VALIDATOR POOL</div>
                        <button onClick={() => setShowStakeForm(true)} className="cube-btn" style={{ borderColor: '#d800ff', color: '#d800ff' }}>⬡ ENTER STAKE</button>
                      </div>
                    )}
                    {showStakeForm && !stakeEntered && (
                      <div style={{ background: '#0a000f', border: '1px solid #d800ff44', borderRadius: '4px', padding: '8px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '8px', color: '#d800ff', letterSpacing: '1px', marginBottom: '6px' }}>⬡ LOCK YOUR STAKE (ETH)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ color: '#d800ff', fontSize: '14px' }}>⬡</span>
                          <input type="number" value={stakeInput} autoFocus onChange={e => setStakeInput(Number(e.target.value))} min="1" placeholder="e.g. 32"
                            style={{ width: '80px', fontSize: '13px', textAlign: 'center', background: 'black', border: '1px solid #d800ff', borderRadius: '3px', color: '#d800ff', padding: '4px', fontFamily: 'monospace', outline: 'none', fontWeight: 'bold' }} />
                          <span style={{ color: '#555', fontSize: '9px' }}>ETH</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { if (!stakeInput || stakeInput < 1) return; setStake(Number(stakeInput)); setStakeEntered(true); setShowStakeForm(false); if (addLog) addLog(`⬡ BLOCK #${index}: Stake locked — ${stakeInput} ETH`, 'info'); }}
                            className="cube-btn" style={{ borderColor: '#00ff00', color: '#00ff00', flex: 1 }}>✓ LOCK STAKE</button>
                          <button onClick={() => setShowStakeForm(false)} className="cube-btn" style={{ borderColor: '#333', color: '#555' }}>✕</button>
                        </div>
                      </div>
                    )}
                    {stakeEntered && (
                      <div>
                        <div style={{ fontSize: '8px', color: '#555', marginBottom: '5px', letterSpacing: '1px' }}>VALIDATORS IN POOL</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '4px' }}>
                          <div style={{ fontSize: '8px', color: '#00ff00', border: '1px solid #00ff0044', borderRadius: '2px', padding: '2px 4px', fontFamily: 'monospace' }}>🧑‍💻 YOU <span style={{ color: '#00ff00' }}>{stake}Ξ</span></div>
                          {FRIEND_LIST.map(f => (
                            <div key={f.name} style={{ fontSize: '8px', color: '#333', border: '1px solid #222', borderRadius: '2px', padding: '2px 4px', fontFamily: 'monospace' }}>{f.emoji} {f.name} <span style={{ color: '#555' }}>?Ξ</span></div>
                          ))}
                        </div>
                        <div style={{ fontSize: '8px', color: '#444', marginBottom: '6px' }}>Your stake: <span style={{ color: '#d800ff' }}>{stake} ETH locked</span> • 30% you win • 70% friends win</div>
                        <button onClick={runValidatorLottery} className="cube-btn" style={{ borderColor: '#d800ff', color: '#d800ff' }}>🎰 RUN LOTTERY</button>
                      </div>
                    )}
                  </div>
                )}

                {lotteryWinner?.isYou && !signature && (
                  <div>
                    <div style={{ background: '#001a00', border: '1px solid #00ff0044', borderRadius: '3px', padding: '7px', marginBottom: '6px', textAlign: 'center' }}>
                      <div style={{ color: '#00ff00', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>🎉 YOU WON!</div>
                      <div style={{ color: '#555', fontSize: '9px' }}>Your stake: <span style={{ color: '#d800ff' }}>{lotteryWinner?.stake || stake} ETH</span> — highest in pool</div>
                    </div>
                    <button onClick={signBlock} className="cube-btn" style={{ borderColor: '#00ff00', color: '#00ff00' }}>✍️ SIGN BLOCK</button>
                  </div>
                )}

                {lotteryWinner && !lotteryWinner.isYou && !signature && (
                  <div style={{ background: '#0a000a', border: '1px solid #d800ff44', borderRadius: '3px', padding: '7px', textAlign: 'center' }}>
                    <div style={{ color: '#d800ff', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>{lotteryWinner.emoji} {lotteryWinner.name} WON</div>
                    <div style={{ color: '#555', fontSize: '9px' }}>stake: <span style={{ color: '#d800ff' }}>{lotteryWinner.stake} ETH</span></div>
                    <div style={{ color: '#555', fontSize: '9px', marginTop: '2px' }}>⟳ signing block...</div>
                  </div>
                )}

                {signature && (
                  <div style={{ background: isSlashed ? '#1a0000' : '#0a000f', border: `1px solid ${isSlashed ? '#ff000088' : '#d800ff55'}`, borderRadius: '4px', padding: '7px', fontSize: '9px', marginTop: '4px' }}>
                    <div style={{ color: isSlashed ? '#ff4444' : '#d800ff', fontSize: '10px', fontWeight: 'bold', marginBottom: '5px', letterSpacing: '1px', borderBottom: `1px solid ${isSlashed ? '#ff000033' : '#d800ff33'}`, paddingBottom: '4px' }}>
                      {isSlashed ? '⚡ VALIDATOR SLASHED' : '✦ PROOF OF STAKE CERTIFICATE'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: '#555' }}>VALIDATOR</span>
                      <span style={{ color: isSlashed ? '#ff4444' : '#fff' }}>{lotteryWinner ? `${lotteryWinner.emoji} ${lotteryWinner.name}` : `🔑 ${validator}`}{isSlashed ? ' ⚡' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: '#555' }}>STAKE LOCKED</span>
                      <span style={{ color: isSlashed ? '#ff4444' : '#d800ff', fontWeight: 'bold', textDecoration: isSlashed ? 'line-through' : 'none' }}>{lotteryWinner ? lotteryWinner.stake : stake} ETH</span>
                    </div>
                    {isValid && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ color: '#555' }}>REWARD EARNED</span>
                        <span style={{ color: '#00ff00', fontWeight: 'bold' }}>+{lotteryWinner?.reward || validatorReward || calcReward(stake)} ETH</span>
                      </div>
                    )}
                    {isSlashed && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ color: '#ff4444' }}>PENALTY</span>
                        <span style={{ color: '#ff4444', fontWeight: 'bold' }}>-{lotteryWinner ? lotteryWinner.stake : stake} ETH CONFISCATED</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: '#555' }}>PUB KEY</span>
                      <span style={{ color: '#333', fontFamily: 'monospace' }}>{lotteryWinner?.publicKey ? lotteryWinner.publicKey.substring(0, 10) + '...' : signerPubKey ? signerPubKey.substring(0, 10) + '...' : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: '#555' }}>SIGNATURE</span>
                      <span style={{ color: '#333', fontFamily: 'monospace' }}>{signature.substring(0, 12)}...</span>
                    </div>
                    <div style={{ marginTop: '5px', textAlign: 'center', background: isSlashed ? '#2a0000' : '#1a0020', borderRadius: '2px', padding: '3px', color: isSlashed ? '#ff4444' : '#d800ff', letterSpacing: '2px', fontSize: '8px' }}>
                      {isSlashed ? '⚡ STAKE CONFISCATED — BLOCK INVALID' : '✓ BLOCK VALIDATED'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isPowValid && <div style={{ color: '#00ff00', marginTop: '5px', fontSize: '9px' }}>[ POW_SECURED ]</div>}
            {isPosValid && <div style={{ color: '#d800ff', marginTop: '5px', fontSize: '9px' }}>[ POS_SECURED ]</div>}
          </div>
        </div>
      </div>

      {/* ── MINING RACE MODAL ── */}
      {showMiningRace && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#020b02', border: '2px solid #00ff00', boxShadow: '0 0 60px #00ff0044, 0 0 120px #00ff0011', borderRadius: '12px', padding: '28px 32px', width: '60vw', maxWidth: '900px', minWidth: '600px', height: '88vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace', animation: 'fadeInScale 0.2s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px', flexShrink: 0 }}>
              <div style={{ color: '#00ff00', fontSize: '22px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '0 0 15px #00ff00' }}>⛏️ MINING RACE</div>
              <div style={{ color: '#00ff0055', fontSize: '10px', letterSpacing: '2px', marginTop: '4px' }}>BLOCK #{index} — FIRST TO FIND HASH STARTING WITH <span style={{ color: '#00ff00', fontWeight: 'bold' }}>00</span> WINS</div>
            </div>
            <div style={{ borderTop: '1px solid #00ff0022', marginBottom: '14px', flexShrink: 0 }} />

            {raceFinished && raceWinner && (
              <div style={{ textAlign: 'center', marginBottom: '14px', padding: '12px 16px', background: '#001a00', border: '1px solid #00ff0055', borderRadius: '6px', boxShadow: '0 0 20px #00ff0022', flexShrink: 0 }}>
                <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px', textShadow: '0 0 10px #00ff00' }}>🏆 {raceWinner.emoji} {raceWinner.name} FOUND IT!</div>
                <div style={{ color: '#00ff0077', fontSize: '11px', marginTop: '4px' }}>{raceWinner.isYou ? '🎉 You beat the entire network — confirm below to add the block' : `⟳ ${raceWinner.name} is writing the block to the chain...`}</div>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#000', borderRadius: '4px', border: '1px solid #00ff0033', textAlign: 'left' }}>
                  <div style={{ color: '#00ff0055', fontSize: '9px', marginBottom: '4px', letterSpacing: '1px' }}>WINNING HASH</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', lineHeight: '1.6' }}>
                    <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '14px' }}>00</span>
                    <span style={{ color: '#00dd00' }}>{raceWinner.hash.substring(2, 20)}</span>
                    <span style={{ color: '#007700' }}>{raceWinner.hash.substring(20)}</span>
                  </div>
                  <div style={{ color: '#00ff0044', fontSize: '9px', marginTop: '4px' }}>NONCE: <span style={{ color: '#00ff0088' }}>{raceWinner.nonce.toLocaleString()}</span></div>
                </div>
              </div>
            )}

            {!raceFinished && (
              <div style={{ textAlign: 'center', color: '#00ff0055', fontSize: '10px', marginBottom: '12px', letterSpacing: '1px', flexShrink: 0 }}>
                ⟳ ALL MINERS SEARCHING — NEED HASH STARTING WITH <span style={{ color: '#00ff00', fontWeight: 'bold' }}>00</span>...
              </div>
            )}

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minHeight: 0 }}>
              {ALL_RACERS.map(racer => {
                const isWinner = raceFinished && raceWinner?.name === racer.name;
                const isYou    = racer.name === 'YOU';
                const rHash    = racerHashes[racer.name] || '????????????????????????????????????????????????????????????????';
                const rNonce   = racerNonces[racer.name] || 0;
                return (
                  <div key={racer.name} style={{ background: isWinner ? '#001f00' : isYou ? '#020f02' : '#060606', border: `1px solid ${isWinner ? '#00ff00' : isYou ? '#00ff0055' : '#1a1a1a'}`, borderRadius: '6px', padding: '10px 14px', transition: 'all 0.3s', boxShadow: isWinner ? '0 0 20px #00ff0044' : 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: isYou || isWinner ? 'bold' : 'normal', color: isWinner ? '#00ff00' : isYou ? '#00dd00' : '#444' }}>
                        {racer.emoji} {racer.name} {isWinner ? '🏆' : ''}
                      </span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isYou ? '#00aa00' : '#2a2a2a' }}>
                        nonce: <span style={{ color: isYou ? '#00cc00' : '#333', fontWeight: 'bold' }}>{rNonce.toLocaleString()}</span>
                      </span>
                    </div>
                    <div style={{ background: '#000', border: `1px solid ${isWinner ? '#00ff0055' : '#0a0a0a'}`, borderRadius: '3px', padding: '6px 8px', fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: '1.5', letterSpacing: '0.3px' }}>
                      {isWinner ? (
                        <>
                          <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '12px' }}>00</span>
                          <span style={{ color: '#00cc00' }}>{rHash.substring(2, 20)}</span>
                          <span style={{ color: '#005500' }}>{rHash.substring(20)}</span>
                        </>
                      ) : (
                        <>
                          <span style={{ color: '#ff4444', fontWeight: 'bold' }}>{rHash.substring(0, 2)}</span>
                          <span style={{ color: '#00cc00' }}>{rHash.substring(2, 32)}</span>
                          <span style={{ color: '#009900' }}>{rHash.substring(32)}</span>
                        </>
                      )}
                    </div>
                    {!raceFinished && (
                      <div style={{ height: '2px', background: '#0a0a0a', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (rNonce / 8000) * 100)}%`, background: isYou ? 'linear-gradient(90deg,#004400,#00ff00)' : 'linear-gradient(90deg,#001a00,#004400)', transition: 'width 0.08s', borderRadius: '1px' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '14px', flexShrink: 0 }}>
              {raceFinished && raceWinner?.isYou && (
                <button onClick={confirmYouWon} style={{ width: '100%', padding: '14px', background: '#00ff00', border: 'none', color: 'black', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', borderRadius: '5px', letterSpacing: '2px', boxShadow: '0 0 25px #00ff0099' }}>
                  🚀 CONFIRM — ADD BLOCK TO CHAIN
                </button>
              )}
              {raceFinished && raceWinner && !raceWinner.isYou && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#001500', border: '1px solid #00ff0022', borderRadius: '5px', color: '#00ff0066', fontSize: '12px', letterSpacing: '1px' }}>
                  ⟳ {raceWinner.emoji} {raceWinner.name} is adding the block... panel will close shortly
                </div>
              )}
              {!raceFinished && (
                <button onClick={() => { clearInterval(raceIntervalRef.current); stopMiningSound(); setShowMiningRace(false); setIsMining(false); }}
                  style={{ width: '100%', padding: '11px', background: 'black', border: '1px solid #ff000044', color: '#ff0000', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer', borderRadius: '5px', letterSpacing: '1px' }}>
                  ✕ CANCEL RACE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LOTTERY MODAL — fullscreen overlay ── */}
      {isSelecting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0a000f', border: '2px solid #d800ff', boxShadow: '0 0 60px #d800ff44, 0 0 120px #d800ff11', borderRadius: '16px', padding: '32px 40px', width: '55vw', maxWidth: '700px', minWidth: '480px', fontFamily: 'monospace', animation: 'fadeInScale 0.3s ease', textAlign: 'center' }}>

            <div style={{ color: '#d800ff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', textShadow: '0 0 15px #d800ff', marginBottom: '4px' }}>🎰 VALIDATOR LOTTERY</div>
            <div style={{ color: '#d800ff44', fontSize: '9px', letterSpacing: '2px', marginBottom: '24px' }}>BLOCK #{index} — HIGHEST STAKE WINS</div>

            {/* Circle of validators */}
            <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #d800ff33', boxShadow: '0 0 20px #d800ff22' }} />

              {[{ name: 'YOU', emoji: '🧑‍💻' }, ...FRIEND_LIST].map((v, i) => {
                const total = FRIEND_LIST.length + 1;
                const angle = (i / total) * 360;
                const rad   = (angle * Math.PI) / 180;
                const r     = 88;
                const x     = 110 + r * Math.sin(rad);
                const y     = 110 - r * Math.cos(rad);
                const isW   = lotteryModalWinner?.name === v.name;
                return (
                  <div key={v.name} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#1a0025',
                      border: `2px solid ${isW ? (lotteryModalWinner.isYou ? '#00ff00' : '#d800ff') : '#d800ff33'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      boxShadow: isW ? `0 0 20px ${lotteryModalWinner.isYou ? '#00ff00' : '#d800ff'}` : '0 0 8px #d800ff22',
                      animation: lotteryModalWinner ? 'none' : `validatorPulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                      transition: 'all 0.4s ease',
                      transform: isW ? 'scale(1.4)' : 'scale(1)',
                      opacity: lotteryModalWinner && !isW ? 0.3 : 1,
                    }}>{v.emoji}</div>
                    <div style={{ fontSize: '7px', color: isW ? (lotteryModalWinner.isYou ? '#00ff00' : '#d800ff') : '#d800ff44', letterSpacing: '0.5px', fontWeight: isW ? 'bold' : 'normal' }}>{v.name}</div>
                  </div>
                );
              })}

              {/* Center */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90px', height: '90px', borderRadius: '50%', background: '#0a000f', border: `2px solid ${lotteryModalWinner ? (lotteryModalWinner.isYou ? '#00ff00' : '#d800ff') : '#d800ff'}`, boxShadow: `0 0 20px ${lotteryModalWinner ? (lotteryModalWinner.isYou ? '#00ff0066' : '#d800ff66') : '#d800ff55'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px', transition: 'all 0.4s ease' }}>
                {lotteryModalWinner ? (
                  <>
                    <div style={{ fontSize: '28px' }}>{lotteryModalWinner.emoji}</div>
                    <div style={{ fontSize: '6px', color: lotteryModalWinner.isYou ? '#00ff00' : '#d800ff', letterSpacing: '1px' }}>WINNER</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '24px', animation: 'spinEmoji 0.6s linear infinite' }}>🎰</div>
                    <div style={{ fontSize: '7px', color: '#d800ff', letterSpacing: '1px' }}>ROLLING</div>
                  </>
                )}
              </div>
            </div>

            {/* Scan text */}
            {!lotteryModalWinner && (
              <div style={{ color: '#d800ff', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>⟳ {scanText}</div>
            )}

            {/* Stake bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
              {[{ name: 'YOU', emoji: '🧑‍💻', stakeVal: stake }, ...FRIEND_LIST.map((f, i) => ({ ...f, stakeVal: stake + Math.floor(Math.sin(i * 99) * 15) + 15 }))].map((v, i) => {
                const maxStake = stake + 45;
                const pct      = Math.min(100, (v.stakeVal / maxStake) * 100);
                const isW      = lotteryModalWinner?.name === v.name;
                return (
                  <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: lotteryModalWinner && !isW ? 0.3 : 1, transition: 'opacity 0.4s ease' }}>
                    <div style={{ width: '60px', textAlign: 'right', fontSize: '9px', color: v.name === 'YOU' ? '#00ff00' : '#d800ff88', whiteSpace: 'nowrap', fontWeight: isW ? 'bold' : 'normal' }}>{v.emoji} {v.name}</div>
                    <div style={{ flex: 1, height: isW ? '12px' : '8px', background: '#0a000f', borderRadius: '4px', border: `1px solid ${isW ? (v.name === 'YOU' ? '#00ff00' : '#d800ff') : '#d800ff22'}`, overflow: 'hidden', transition: 'all 0.4s ease' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: v.name === 'YOU' ? 'linear-gradient(90deg,#004400,#00ff00)' : 'linear-gradient(90deg,#2a0040,#d800ff)', borderRadius: '4px', boxShadow: isW ? (v.name === 'YOU' ? '0 0 10px #00ff00' : '0 0 10px #d800ff') : 'none', transition: 'all 0.4s ease' }} />
                    </div>
                    <div style={{ width: '32px', fontSize: '9px', color: v.name === 'YOU' ? '#00ff00' : '#d800ff66', fontWeight: isW ? 'bold' : 'normal' }}>{v.stakeVal}Ξ</div>
                  </div>
                );
              })}
            </div>

            {/* Winner reveal banner */}
            {lotteryModalWinner && (
              <div style={{ padding: '16px', borderRadius: '10px', background: lotteryModalWinner.isYou ? '#001a00' : '#1a0030', border: `2px solid ${lotteryModalWinner.isYou ? '#00ff00' : '#d800ff'}`, boxShadow: `0 0 30px ${lotteryModalWinner.isYou ? '#00ff0044' : '#d800ff44'}`, animation: 'fadeInScale 0.4s ease' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{lotteryModalWinner.emoji}</div>
                <div style={{ color: lotteryModalWinner.isYou ? '#00ff00' : '#d800ff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '3px', textShadow: `0 0 15px ${lotteryModalWinner.isYou ? '#00ff00' : '#d800ff'}`, marginBottom: '8px' }}>
                  {lotteryModalWinner.isYou ? '🎉 YOU WIN!' : `🏆 ${lotteryModalWinner.name} WINS!`}
                </div>
                <div style={{ color: lotteryModalWinner.isYou ? '#00ff0088' : '#d800ff88', fontSize: '11px', marginBottom: '4px' }}>
                  HIGHEST STAKE: <span style={{ fontWeight: 'bold', color: lotteryModalWinner.isYou ? '#00ff00' : '#d800ff' }}>{lotteryModalWinner.stake} ETH</span>
                </div>
                <div style={{ color: '#555', fontSize: '9px', letterSpacing: '1px', marginTop: '8px' }}>
                  {lotteryModalWinner.isYou ? '✍️ SIGN THE BLOCK TO EARN YOUR REWARD' : '⟳ VALIDATOR IS SIGNING THE BLOCK...'}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes validatorPulse {
          from { box-shadow: 0 0 4px #d800ff44; transform: scale(1); }
          to   { box-shadow: 0 0 14px #d800ffaa; transform: scale(1.12); }
        }
        @keyframes spinEmoji {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Block;
