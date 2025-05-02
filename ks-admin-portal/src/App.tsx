import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Login } from '@/components/pages/Login';
import { Dashboard } from '@/components/pages/Dashboard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// API URL for display
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Add other protected routes here */}

          {/* Default route - redirect to dashboard if logged in, otherwise to login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster />
        <SonnerToaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))'
            },
          }}
        />

        {/* Development helper - show API URL */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-2 left-2 right-2 flex items-center justify-between rounded bg-muted p-2 text-xs opacity-80">
            <div>
              <span className="font-semibold">API:</span> {API_URL}
            </div>
            <div>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </Router>
    </AuthProvider>
  );
}

export default App;
