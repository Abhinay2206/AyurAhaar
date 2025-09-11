import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/auth';
import { DashboardScreen } from './pages/dashboard';
import { PatientManagementScreen } from './pages/patients';
import { Layout } from './components';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/app" element={<Layout />}>
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="patients" element={<PatientManagementScreen />} />
            <Route path="appointments" element={<div style={{padding: '2rem'}}>Appointments Page Coming Soon</div>} />
            <Route path="meal-plans" element={<div style={{padding: '2rem'}}>Meal Plans Page Coming Soon</div>} />
            <Route path="analytics" element={<div style={{padding: '2rem'}}>Analytics Page Coming Soon</div>} />
            <Route path="messages" element={<div style={{padding: '2rem'}}>Messages Page Coming Soon</div>} />
            <Route path="settings" element={<div style={{padding: '2rem'}}>Settings Page Coming Soon</div>} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
