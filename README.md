# BlockSim: Interactive Blockchain Visualizer ⛓️

An interactive, web-based visualizer designed to demystify blockchain technology. **BlockSim** allows users to explore and interact with core blockchain mechanics in real-time, including cryptographic hashing, block mining, and the nuances of different consensus algorithms like **Proof of Work (PoW)** and **Proof of Stake (PoS)**.

*Developed for the CSE 3100 course under the supervision of Prof. Dr. M N I Mondal at Rajshahi University of Engineering & Technology (RUET).*

## 🚀 Features

- **Interactive Hashing:** Visualize how data manipulation alters cryptographic hashes instantly.
- **Block Mining Simulation:** Understand the computational effort behind mining by experimenting with block difficulty and nonces.
- **Consensus Mechanisms:** - **Proof of Work (PoW):** Step-by-step visual simulation of miners competing to solve cryptographic puzzles.
  - **Proof of Stake (PoS):** Interactive demonstration of validator selection based on staked assets.
- **Chain Integrity:** Watch how tampering with a single block invalidates the subsequent chain.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, CSS3, HTML5
- **Backend:** Node.js
- **Languages:** JavaScript (ES6+)

## 📁 Project Structure

```text
BlockSim/
├── backend/            # Node.js server and core blockchain logic
├── public/             # Static assets (images, icons)
├── src/                # React frontend source code (components, styles, views)
├── index.html          # Main HTML entry point
├── package.json        # Project dependencies and scripts
└── vite.config.js      # Vite bundler configuration
