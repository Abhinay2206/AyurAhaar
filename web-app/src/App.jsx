import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen, DoctorRegistrationScreen } from './pages/auth';
import { ComprehensiveDashboard } from './pages/dashboard';
import { PatientManagementScreen } from './pages/patients';
import { AppointmentManagementScreen } from './pages/appointments';
import { MealPlanGenerationScreen } from './pages/meal-plans';
import { 
  SuperAdminLogin, 
  SuperAdminDashboard, 
  DoctorManagement, 
  FoodDatabase,
  PatientAnalytics,
  MealPlanManagement
} from './pages/super-admin';
import { Layout, SuperAdminLayout } from './components';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Doctor Portal Routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<DoctorRegistrationScreen />} />
          <Route path="/app" element={<Layout />}>
            <Route path="dashboard" element={<ComprehensiveDashboard />} />
            <Route path="patients" element={<PatientManagementScreen />} />
            <Route path="appointments" element={<AppointmentManagementScreen />} />
            <Route path="meal-plans" element={<MealPlanGenerationScreen />} />
            <Route path="analytics" element={<div style={{padding: '2rem'}}>Analytics Page Coming Soon</div>} />
            <Route path="messages" element={<div style={{padding: '2rem'}}>Messages Page Coming Soon</div>} />
            <Route path="settings" element={<div style={{padding: '2rem'}}>Settings Page Coming Soon</div>} />
          </Route>
          
          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="doctors" element={<DoctorManagement />} />
            <Route path="patients" element={<PatientAnalytics />} />
            <Route path="food-database" element={<FoodDatabase />} />
            <Route path="meal-plans" element={<MealPlanManagement />} />
            <Route path="analytics" element={<div style={{padding: '2rem'}}>System Analytics Coming Soon</div>} />
            <Route path="settings" element={<div style={{padding: '2rem'}}>System Settings Coming Soon</div>} />
          </Route>
          
          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
