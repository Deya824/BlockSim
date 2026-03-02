import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import LandingPage from './LandingPage';
import Simulator from './Simulator';
import InfoPage from './InfoPage';
import ProtectedRoute from './ProtectedRoute';
import './index.css';

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