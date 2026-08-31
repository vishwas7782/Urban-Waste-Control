import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import PublicReport from './pages/PublicReport.jsx';
import PublicSchedule from './pages/PublicSchedule.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import MunicipalDashboard from './pages/MunicipalDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        // Clear the sticky navbar: at z-index 9999 a top-right toast would
        // otherwise sit on top of the hamburger button on a phone. Spanning
        // left-to-right lets long messages wrap across the screen instead of
        // stacking up in a narrow column.
        containerStyle={{
          top: 'calc(var(--nav-h) + 0.5rem)',
          left: '0.75rem',
          right: '0.75rem',
        }}
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '0.92rem', maxWidth: '100%' },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/report" element={<PublicReport />} />
          <Route path="/schedule" element={<PublicSchedule />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/municipal"
            element={
              <ProtectedRoute requiredRole="municipal">
                <MunicipalDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
