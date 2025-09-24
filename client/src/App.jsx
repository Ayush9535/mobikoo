
import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Pages/AuthPages/Login';
import Signup from './Pages/AuthPages/Signup';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ManagerDashboard from './Pages/Manager/ManagerDashboard';
import ShopOwnerDashboard from './Pages/ShopOwner/ShopOwnerDashboard';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}


function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const payload = parseJwt(token);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              payload && payload.role === 'admin' ? (
                <Navigate to="/admin-dashboard" replace />
              ) : payload && payload.role === 'manager' ? (
                <Navigate to="/manager-dashboard" replace />
              ) : payload && payload.role === 'shopowner' ? (
                <Navigate to="/shopowner-dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <>
                <Login onLogin={handleLogin} />
                <div style={{textAlign:'center',marginTop:'1rem'}}>
                  <span>Admin? <a href="/signup" style={{color:'#2563eb'}}>Create User</a></span>
                </div>
              </>
            )
          }
        />
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to={payload && payload.role === 'admin' ? "/admin-dashboard" : payload && payload.role === 'shopowner' ? "/shopowner-dashboard" : "/"} replace />
            ) : (
              <>
                <Signup />
                <div style={{textAlign:'center',marginTop:'1rem'}}>
                  <span>Back to <a href="/login" style={{color:'#2563eb'}}>Login</a></span>
                </div>
              </>
            )
          }
        />
        <Route
          path="/shopowner-dashboard"
          element={
            token && payload && payload.role === 'shopowner' ? (
              <ShopOwnerDashboard shopOwner={{
                shop_name: payload.shop_name,
                shop_code: payload.shop_code,
                shop_address: payload.shop_address,
                email: payload.email,
                contact_number: payload.contact_number
              }} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            token && payload && payload.role === 'admin' ? (
              <AdminDashboard adminName={payload.email} adminCode={payload.admin_code || 'AD001'} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/manager-dashboard/*"
          element={
            token && payload && payload.role === 'manager' ? (
              <ManagerDashboard managerName={payload.email} managerCode={payload.manager_code || 'MG001'} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            token ? (
              payload && payload.role === 'admin' ? (
                <Navigate to="/admin-dashboard" replace />
              ) : payload && payload.role === 'manager' ? (
                <Navigate to="/manager-dashboard" replace />
              ) : payload && payload.role === 'shopowner' ? (
                <Navigate to="/shopowner-dashboard" replace />
              ) : (
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',flexDirection:'column'}}>
                  <h2>Logged in successfully!</h2>
                  <button onClick={() => setToken(null)}>Logout</button>
                </div>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
