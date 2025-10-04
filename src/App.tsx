// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ConsultationPage } from './pages/ConsultationPage';
// import { TreatmentPage } from './pages/TreatmentPage';
import { PatientsPage } from './pages/PatientsPage';
import { AppointmentsPage } from './pages/RendezVousPage';
import PrescriptionsPage  from './pages/OrdonnancesPage';
// import { ExamensPage } from './pages/ExamensPage';
// import { MedicamentsPage } from './pages/MedicamentsPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="consultation" element={<ConsultationPage />} />
          {/* <Route path="traitement" element={<TreatmentPage />} /> */}
          <Route path="patients" element={<PatientsPage />} />
          <Route path="rendez-vous" element={<AppointmentsPage />} />
          <Route path="ordonnances" element={<PrescriptionsPage />} />
          {/* <Route path="examens" element={<ExamensPage />} /> */}
          {/* <Route path="medicaments" element={<MedicamentsPage />} /> */}
        </Route>

        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: { background: '#10b981' },
          },
          error: {
            style: { background: '#ef4444' },
          },
        }}
      />
    </Router>
  );
}

export default App;

