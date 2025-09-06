import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ShopAdminDashboard from './components/ShopAdminDashboard';
import './App.css';

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Render different dashboards based on user role
  if (user?.role === 'super_admin') {
    return <SuperAdminDashboard />;
  } else if (user?.role === 'shop_admin') {
    return <ShopAdminDashboard />;
  } else {
    // For other roles (cashier, optician, accountant)
    return (
      <div className="dashboard-placeholder">
        <h1>Welcome, {user?.name}!</h1>
        <p>Dashboard for {user?.role} role is coming soon...</p>
      </div>
    );
  }
}

export default App;
