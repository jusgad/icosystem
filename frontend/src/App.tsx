import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './components/Auth/LoginPage';
import EntrepreneurDashboard from './components/Dashboard/EntrepreneurDashboard';
import LifecycleForm from './components/Forms/LifecycleForm';
import MeetingCalendar from './components/Meetings/MeetingCalendar';
import MessageCenter from './components/Messages/MessageCenter';
import DocumentManager from './components/Documents/DocumentManager';
import ImpactDashboard from './components/Reports/ImpactDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
});

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              {user?.role === 'entrepreneur' && <EntrepreneurDashboard />}
              {user?.role === 'ally' && <div>Ally Dashboard - En construcción</div>}
              {user?.role === 'client' && <div>Client Dashboard - En construcción</div>}
              {user?.role === 'super_user' && <div>Super User Dashboard - En construcción</div>}
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/forms"
        element={
          <PrivateRoute>
            <AppLayout>
              <LifecycleForm />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <PrivateRoute>
            <AppLayout>
              <MeetingCalendar />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <AppLayout>
              <MessageCenter />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <AppLayout>
              <DocumentManager />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <AppLayout>
              <div>Gestión de Usuarios - En construcción</div>
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/directory"
        element={
          <PrivateRoute>
            <AppLayout>
              <div>Directorio - En construcción</div>
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <AppLayout>
              <ImpactDashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AppLayout>
              <div>Perfil - En construcción</div>
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
