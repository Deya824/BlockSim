import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import LandingPage from './LandingPage';
import Simulator from './Simulator';
import InfoPage from './InfoPage';
import ProtectedRoute from './ProtectedRoute';
import './index.css';
import TamperAttack     from './TamperAttack';
import FiftyOneAttack   from './FiftyOneAttack';
import ReplayAttack     from './ReplayAttack';
import SybilAttack      from './SybilAttack';
import DoubleSpendAttack from './DoubleSpendAttack';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ACCESS: Identity Verification Portal */}
        <Route path="/login" element={<Login />} />

        {/* SECURE AREA: RUET CSE Student Project Workspace */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/simulate" 
          element={
            <ProtectedRoute>
              <Simulator />
            </ProtectedRoute>
          } 
        />
         <Route path="/attack/tamper"      element={<TamperAttack />} />
        <Route path="/attack/fifty-one"   element={<FiftyOneAttack />} />
        <Route path="/attack/replay"      element={<ReplayAttack />} />
        <Route path="/attack/sybil"       element={<SybilAttack />} />
        <Route path="/attack/doublespend" element={<DoubleSpendAttack />} />
        
        <Route 
          path="/info" 
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;



