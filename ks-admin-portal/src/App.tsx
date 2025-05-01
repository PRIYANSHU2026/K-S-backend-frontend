import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/shared/ProtectedRoute';
import { Login } from '@/components/pages/Login';
import { Dashboard } from '@/components/pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
          </Route>

          {/* Product Routes */}
          <Route path="/products" element={<ProtectedRoute requiredPermission="products.view" />}>
            <Route index element={<div>Products List</div>} />
            <Route path="new" element={<div>New Product</div>} />
            <Route path=":id" element={<div>Edit Product</div>} />
          </Route>

          {/* Category Routes */}
          <Route path="/categories" element={<ProtectedRoute requiredPermission="categories.view" />}>
            <Route index element={<div>Categories List</div>} />
            <Route path="new" element={<div>New Category</div>} />
            <Route path=":id" element={<div>Edit Category</div>} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customers" element={<ProtectedRoute requiredPermission="customers.view" />}>
            <Route index element={<div>Customers List</div>} />
            <Route path="new" element={<div>New Customer</div>} />
            <Route path=":id" element={<div>Edit Customer</div>} />
          </Route>

          {/* Warranty Routes */}
          <Route path="/warranties" element={<ProtectedRoute requiredPermission="warranties.view" />}>
            <Route index element={<div>Warranties List</div>} />
            <Route path="new" element={<div>New Warranty</div>} />
            <Route path=":id" element={<div>Edit Warranty</div>} />
          </Route>

          {/* User Routes */}
          <Route path="/users" element={<ProtectedRoute requiredPermission="users.view" />}>
            <Route index element={<div>Users List</div>} />
            <Route path="new" element={<div>New User</div>} />
            <Route path=":id" element={<div>Edit User</div>} />
          </Route>

          {/* Role Routes */}
          <Route path="/roles" element={<ProtectedRoute requiredPermission="roles.view" />}>
            <Route index element={<div>Roles List</div>} />
            <Route path="new" element={<div>New Role</div>} />
            <Route path=":id" element={<div>Edit Role</div>} />
          </Route>

          {/* Settings Routes */}
          <Route path="/settings" element={<ProtectedRoute />}>
            <Route path="profile" element={<div>User Profile</div>} />
            <Route path="password" element={<div>Change Password</div>} />
          </Route>

          {/* Redirect / to /dashboard if authenticated */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
