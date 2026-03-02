import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InfoPage = () => {
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a', // Deep black-gray
      color: '#e5e5e5', // High contrast off-white text
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', // Readable font
      padding: '0',
      lineHeight: '1.8', // Spaced out for reading
      overflowX: 'hidden',
    },
    navButton: {
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 100,
      background: 'rgba(0,0,0,0.8)',
      border: '1px solid #00ff00',
      color: '#00ff00',
      padding: '10px 24px',
      fontFamily: "'Courier New', monospace",
      fontWeight: 'bold',
      cursor: 'pointer',
      backdropFilter: 'blur(5px)',
      transition: 'all 0.3s ease',
    },
    headerHero: {
      background: 'linear-gradient(180deg, #0f172a 0%, #0a0a0a 100%)',
      padding: '120px 20px 80px 20px',
      textAlign: 'center',
      borderBottom: '1px solid #333',
    },
    mainTitle: {
      fontFamily: "'Courier New', monospace",
      fontSize: 'clamp(2.5rem, 5vw, 4rem)', // Responsive size
      color: '#fff',
      textShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
      marginBottom: '10px',
    },
    subTitle: {
      color: '#00ff00',
      fontFamily: "'Courier New', monospace",
      letterSpacing: '4px',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
    },
    contentWrapper: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '60px 20px',
    },
    sectionCard: {
      backgroundColor: '#111',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '40px',
      marginBottom: '60px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontFamily: "'Courier New', monospace",
      fontSize: '2rem',
      color: '#fff',
      marginBottom: '10px',
      borderBottom: '2px solid #333',
      paddingBottom: '20px',
      display: 'inline-block',
      width: '100%',
    },
    imageContainer: {
      width: '100%',
      height: '300px',
      overflow: 'hidden',
      borderRadius: '8px',
      margin: '30px 0',
      border: '1px solid #444',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    textBlock: {
      fontSize: '1.1rem',
      color: '#cccccc',
      marginBottom: '20px',
    },
    stepList: {
      listStyle: 'none',
      padding: 0,
      marginTop: '30px',
    },
    stepItem: {
      display: 'flex',
      marginBottom: '20px',
      background: 'rgba(255,255,255,0.03)',
      padding: '20px',
      borderRadius: '8px',
      borderLeft: '4px solid #00ff00',
    },
    stepNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#00ff00',
      marginRight: '20px',
      fontFamily: "'Courier New', monospace",
    },
  };

  return (
    <div style={styles.container}>
      
      {/* RETURN BUTTON */}
      <button 
        onClick={() => navigate('/')}
        style={styles.navButton}
        onMouseOver={(e) => { e.target.style.background = '#00ff00'; e.target.style.color = 'black'; }}
        onMouseOut={(e) => { e.target.style.background = 'rgba(0,0,0,0.8)'; e.target.style.color = '#00ff00'; }}
      >
        &lt;&lt; BACK_TO_SIMULATION
      </button>

      {/* HERO HEADER */}
      <div style={styles.headerHero}>
        <h1 style={styles.mainTitle}>BLOCKCHAIN PROTOCOLS</h1>
        <p style={styles.subTitle}>// COMPREHENSIVE_SYSTEM_ANALYSIS</p>
      </div>

      <div style={styles.contentWrapper}>

        {/* --- SECTION 1: WHAT IS BLOCKCHAIN? --- */}
        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>1. The Architecture</h2>
          
          <div style={styles.imageContainer}>
             {/* Abstract Network Image */}
             <img 
               src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop" 
               alt="Blockchain Network" 
               style={styles.image}
             />
          </div>

          <div style={styles.textBlock}>
            <p>
              At its simplest, a blockchain is a <strong>shared, immutable ledger</strong> that facilitates the process of recording transactions and tracking assets in a business network.
            </p>
            <p>
              Imagine a Google Doc. When you share it with a group, the document is distributed instead of copied or transferred. Everyone has access to the document at the same time. No one is locked out awaiting changes from another party, and all modifications to the document are being recorded in real-time, making changes completely transparent.
            </p>
          </div>
          
          <div style={{...styles.stepItem, borderLeftColor: '#3b82f6'}}>
            <div style={{...styles.stepNumber, color: '#3b82f6'}}>KEY</div>
            <div>
              <strong>Decentralization:</strong> No single entity (like a bank or government) controls the network. If one node goes down, the network survives.
            </div>
          </div>
        </div>


        {/* --- SECTION 2: PROOF OF WORK (MINING) --- */}
        <div style={styles.sectionCard}>
          <h2 style={{...styles.sectionTitle, borderColor: '#00ff00'}}>2. Proof of Work (PoW)</h2>
          <p style={{color: '#00ff00', fontFamily: 'monospace', marginBottom: '20px'}}>
            USED BY: BITCOIN
          </p>

          <div style={styles.imageContainer}>
             {/* Mining Rig Image */}
             <img 
               src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2940&auto=format&fit=crop" 
               alt="Crypto Mining Farm" 
               style={styles.image}
             />
          </div>

          <p style={styles.textBlock}>
            Proof of Work is the original consensus algorithm in a Blockchain network. It is used to confirm transactions and produce new blocks to the chain. With PoW, miners compete against each other to complete transactions on the network and get rewarded.
          </p>

          <h3 style={{color: 'white', marginTop: '30px', fontFamily: "'Courier New', monospace"}}>HOW IT WORKS (STEP-BY-STEP):</h3>
          
          <ul style={styles.stepList}>
            <li style={styles.stepItem}>
              <span style={styles.stepNumber}>01</span>
              <div>
                <strong>The Bundle:</strong> Miners collect all pending transactions from the network pool and bundle them into a candidate block.
              </div>
            </li>
            <li style={styles.stepItem}>
              <span style={styles.stepNumber}>02</span>
              <div>
                <strong>The Puzzle (Nonce):</strong> The block's data is run through a hashing algorithm (SHA-256). The goal is to find a hash that starts with a specific number of zeroes (e.g., "0000..."). This is extremely hard and requires guessing a random number called a <em>Nonce</em> millions of times per second.
              </div>
            </li>
            <li style={styles.stepItem}>
              <span style={styles.stepNumber}>03</span>
              <div>
                <strong>The Broadcast:</strong> The first miner to find the correct Nonce shouts "Found it!" to the network.
              </div>
            </li>
            <li style={styles.stepItem}>
              <span style={styles.stepNumber}>04</span>
              <div>
                <strong>Verification:</strong> Other miners check the solution (which is easy to verify, like a Sudoku puzzle). If correct, the block is added to the chain, and the miner gets paid.
              </div>
            </li>
          </ul>
        </div>


        {/* --- SECTION 3: PROOF OF STAKE (STAKING) --- */}
        <div style={styles.sectionCard}>
          <h2 style={{...styles.sectionTitle, borderColor: '#d800ff'}}>3. Proof of Stake (PoS)</h2>
          <p style={{color: '#d800ff', fontFamily: 'monospace', marginBottom: '20px'}}>
            USED BY: ETHEREUM 2.0, SOLANA
          </p>

          <div style={styles.imageContainer}>
             {/* Abstract Staking Image */}
             <img 
               src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
               alt="Proof of Stake Concept" 
               style={styles.image}
             />
          </div>

          <p style={styles.textBlock}>
            Proof of Stake was created as an alternative to PoW to solve energy consumption issues. Instead of using electricity to guess numbers, users "lock up" (stake) their coins to vouch for the network's security.
          </p>

          <ul style={styles.stepList}>
            <li style={{...styles.stepItem, borderLeftColor: '#d800ff'}}>
              <span style={{...styles.stepNumber, color: '#d800ff'}}>01</span>
              <div>
                <strong>Staking:</strong> A user deposits 32 ETH (for example) into a smart contract. They become a "Validator."
              </div>
            </li>
            <li style={{...styles.stepItem, borderLeftColor: '#d800ff'}}>
              <span style={{...styles.stepNumber, color: '#d800ff'}}>02</span>
              <div>
                <strong>Selection:</strong> The network's algorithm randomly selects a Validator to create the next block. The more money you stake, the higher your chance of being picked.
              </div>
            </li>
            <li style={{...styles.stepItem, borderLeftColor: '#d800ff'}}>
              <span style={{...styles.stepNumber, color: '#d800ff'}}>03</span>
              <div>
                <strong>Validation & Slashing:</strong> Other validators attest that the block is valid. If the creator tries to cheat (approve fake transactions), a portion of their staked money is "slashed" (destroyed) as a penalty.
              </div>
            </li>
          </ul>
        </div>


        {/* --- SECTION 4: SECURITY --- */}
        <div style={{...styles.sectionCard, border: '1px solid #ef4444'}}>
          <h2 style={{...styles.sectionTitle, borderColor: '#ef4444', color: '#ef4444'}}>4. The 51% Attack</h2>
          
          <div style={{display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px'}}>
             <div style={{flex: 1}}>
                <p style={styles.textBlock}>
                   This is the "Nightmare Scenario" for any blockchain.
                   <br/><br/>
                   If a single group manages to control <strong>more than 50%</strong> of the network's computing power (in PoW) or staked coins (in PoS), they become the dictator of the chain.
                </p>
                <ul style={{color: '#f87171', listStyle: 'square', paddingLeft: '20px', lineHeight: '2'}}>
                   <li>They can reverse their own transactions (double-spend money).</li>
                   <li>They can prevent new transactions from gaining confirmations.</li>
                   <li>They cannot steal other people's money or create new coins out of thin air.</li>
                </ul>
             </div>
             {/* Security Image */}
             <div style={{flex: 1, height: '200px', borderRadius: '8px', overflow: 'hidden'}}>
                <img 
                  src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2940&auto=format&fit=crop" 
                  alt="Cyber Security" 
                  style={{width:'100%', height: '100%', objectFit: 'cover'}} 
                />
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{textAlign: 'center', opacity: 0.5, marginTop: '50px', fontSize: '0.8rem'}}>
          SYSTEM_ID: 2203057 // SECURE_CONNECTION
        </div>

      </div>
    </div>
  );
};

export default InfoPage;