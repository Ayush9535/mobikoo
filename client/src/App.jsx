
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './Pages/AuthPages/Login';
import Signup from './Pages/AuthPages/Signup';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ManagerDashboard from './Pages/Manager/ManagerDashboard';
import ShopOwnerDashboard from './Pages/ShopOwner/ShopOwnerDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <>
              <Login />
            </>
          } />
          <Route path="/signup" element={
            <>
              <Signup />
            </>
          } />
          
          {/* Protected routes */}
          <Route path="/admin-dashboard/*" element={
            <ProtectedRoute allowedUserTypes={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager-dashboard/*" element={
            <ProtectedRoute allowedUserTypes={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/shopowner-dashboard/*" element={
            <ProtectedRoute allowedUserTypes={['shopowner']}>
              <ShopOwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
