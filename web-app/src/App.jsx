import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen, DoctorRegistrationScreen } from './pages/auth';
import { ComprehensiveDashboard } from './pages/dashboard';
import { PatientManagementScreen } from './pages/patients';
import { MealPlanGenerationScreen } from './pages/meal-plans';
import TreatmentPlansScreen from './pages/treatment-plans';
import MealPlanCreationScreen from './pages/meal-plan-creation/MealPlanCreationScreen';
import { ConsultationsScreen } from './pages/consultations';
import { PrescriptionsScreen } from './pages/prescriptions';
import { ReportsScreen } from './pages/reports';
import { AnalyticsScreen } from './pages/analytics';
import { MessagesScreen } from './pages/messages';
import { SettingsScreen } from './pages/settings';
import { 
  SuperAdminLogin, 
  SuperAdminDashboard, 
  DoctorManagement, 
  FoodDatabase,
  PatientAnalytics,
  MealPlanManagement
} from './pages/super-admin';
import { Layout } from './components';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root Route redirects to auth */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          
          {/* Doctor Portal Routes */}
          <Route path="/auth" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<DoctorRegistrationScreen />} />
          <Route path="/app" element={<Layout />}>
            <Route path="dashboard" element={<ComprehensiveDashboard />} />
            <Route path="patients" element={<PatientManagementScreen />} />
            <Route path="consultations" element={<ConsultationsScreen />} />
            <Route path="meal-plans" element={<MealPlanGenerationScreen />} />
            <Route path="treatment-plans" element={<TreatmentPlansScreen />} />
            <Route path="prescriptions" element={<PrescriptionsScreen />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="analytics" element={<AnalyticsScreen />} />
            <Route path="messages" element={<MessagesScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>

          {/* Standalone Routes */}
          <Route path="/meal-plan-creation" element={<MealPlanCreationScreen />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin" element={<Layout />}>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="doctors" element={<DoctorManagement />} />
            <Route path="patients" element={<PatientAnalytics />} />
            <Route path="food-database" element={<FoodDatabase />} />
            <Route path="meal-plans" element={<MealPlanManagement />} />
            <Route path="revenue" element={<div style={{padding: '2rem'}}>Revenue Analytics Coming Soon</div>} />
            <Route path="system-health" element={<div style={{padding: '2rem'}}>System Health Coming Soon</div>} />
            <Route path="reports" element={<div style={{padding: '2rem'}}>Reports Coming Soon</div>} />
            <Route path="settings" element={<div style={{padding: '2rem'}}>System Settings Coming Soon</div>} />
          </Route>
          
          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/super-admin/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
