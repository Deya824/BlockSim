const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
app.use(express.json());
// STRICT CORS POLICY: Allow your React app port (likely 5173 for Vite)
app.use(cors({
  origin: "http://localhost:5173", // Check if your React app is on 5173 or 3000
  methods: ["GET", "POST"],
  credentials: true
}));




// --- 1. CONNECTION ---
// Your Roll: 2203057 - Using your cloud URI
const MONGO_URI = "mongodb+srv://deyafabliha:test1234@cluster0.piadh.mongodb.net/blockchain_db?retryWrites=true&w=majority";



mongoose.connect(MONGO_URI,{
  serverSelectionTimeoutMS: 15000,
  tls: true,
  tlsAllowInvalidCertificates: true,
}).then(() => {
  console.log("✅ MongoDB Connected");
}).catch(err => {
  console.error("❌ Connection failed:", err.message);
});


// --- 2. SCHEMA ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  blockchain: { type: Array, default: [] } 
});

const User = mongoose.model('User', UserSchema);

// --- 3. ROBUST LOGIN (Prevents 500 Error) ---
app.post('/login', async (req, res) => {
  console.log(">>> RECEIVED LOGIN REQUEST FOR:", req.body.email);
  
  try {
    const { email, password } = req.body;

    // Safety Check: Avoid querying with empty values
    if (!email || !password) {
      console.log("⚠️ ERROR: Missing email or password in request");
      return res.status(400).json({ success: false, message: "Credentials required" });
    }

    // Database Query
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log("❌ USER NOT FOUND IN DB");
      return res.status(401).json({ success: false, message: "User not registered" });
    }

    if (user.password !== password) {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    console.log("✅ LOGIN SUCCESSFUL");
    return res.json({ 
      success: true, 
      email: user.email, 
      blockchain: user.blockchain 
    });

  } catch (err) {
    // This catches the 500 error and tells you WHY in the terminal
    console.error("🔥 CRITICAL SERVER ERROR:", err.message);
    return res.status(500).json({ success: false, message: "Internal Database Crash" });
  }
});

// --- 4. REGISTRATION ---
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ success: false, message: "Already exists" });

    const newUser = new User({ 
      email: cleanEmail, 
      password, 
      blockchain: [{ index: 1, hash: "0", previousHash: "0", data: "GENESIS" }] 
    });
    
    await newUser.save();
    console.log("✅ NEW USER SAVED:", cleanEmail);
    res.json({ success: true, message: "Registered!" });
  } catch (err) {
    console.error("🔥 REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Registration crash" });
  }
});

app.listen(5000, () => console.log("🚀 SERVER LIVE ON PORT 5000"));
// --- NEW: LOAD BLOCKCHAIN DATA ---
app.get('/load/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase().trim() });
    if (user) {
      res.json({ success: true, blockchain: user.blockchain });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Load failed" });
  }
});

// --- NEW: SAVE/SYNC BLOCKCHAIN DATA ---
app.post('/save', async (req, res) => {
  try {
    const { email, blockchain } = req.body;
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { blockchain: blockchain } },
      { new: true }
    );
    if (user) {
      console.log(`✅ Blockchain synced for: ${email}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ success: false });
  }
});