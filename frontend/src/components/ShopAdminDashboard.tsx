import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import CustomerManagement from './CustomerManagement';
import InventoryManagement from './InventoryManagement';
import SalesBilling from './SalesBilling';
import PaymentAccounting from './PaymentAccounting';
import ReportsAnalytics from './ReportsAnalytics';
import StaffManagement from './StaffManagement';
import ShopSettings from './ShopSettings';

const ShopAdminDashboard: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopStats, setShopStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch shop statistics
  const fetchShopStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/shops/${user?.shopId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setShopStats(stats);
      }
    } catch (error) {
      console.error('Error fetching shop stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopStats();
  }, []);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'customers', label: 'Customer Management', icon: '👥' },
    { id: 'inventory', label: 'Inventory & Stock', icon: '📦' },
    { id: 'sales', label: 'Sales & Billing', icon: '💰' },
    { id: 'payments', label: 'Payment & Accounting', icon: '💳' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'staff', label: 'Staff & User Roles', icon: '👨‍💼' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading shop dashboard...</p>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's what's happening at your optical shop today.</p>
        </div>

        {/* Shop Statistics */}
        {shopStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Today's Sales</h3>
                <p className="stat-number">₹{shopStats.todaySales || 0}</p>
                <p className="stat-label">+12% from yesterday</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Customers</h3>
                <p className="stat-number">{shopStats.totalCustomers || 0}</p>
                <p className="stat-label">Active customers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Low Stock Items</h3>
                <p className="stat-number">{shopStats.lowStockItems || 0}</p>
                <p className="stat-label">Need attention</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Appointments</h3>
                <p className="stat-number">{shopStats.todayAppointments || 0}</p>
                <p className="stat-label">Today's schedule</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setActiveTab('sales')}>
              <span className="action-icon">💰</span>
              New Sale
            </button>
            <button className="action-btn" onClick={() => setActiveTab('customers')}>
              <span className="action-icon">👥</span>
              Add Customer
            </button>
            <button className="action-btn" onClick={() => setActiveTab('inventory')}>
              <span className="action-icon">📦</span>
              Check Stock
            </button>
            <button className="action-btn" onClick={() => setActiveTab('payments')}>
              <span className="action-icon">💳</span>
              Record Payment
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-content">
                <div className="activity-text">New sale completed - ₹2,500</div>
                <div className="activity-time">2 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-content">
                <div className="activity-text">New customer registered - John Doe</div>
                <div className="activity-time">15 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📦</div>
              <div className="activity-content">
                <div className="activity-text">Low stock alert - Ray-Ban frames</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💳</div>
              <div className="activity-content">
                <div className="activity-text">Payment received - ₹1,800</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'customers':
        return <CustomerManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'sales':
        return <SalesBilling />;
      case 'payments':
        return <PaymentAccounting />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'staff':
        return <StaffManagement />;
      case 'settings':
        return <ShopSettings />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className={`shop-admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👓</span>
            {!sidebarCollapsed && <span className="logo-text">Optical Shop</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-text">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Shop Admin</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-header">
          <h1 className="page-title">
            {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div className="header-actions">
            <button className="notification-btn" title="Notifications">
              🔔
            </button>
            <button className="profile-btn" title="Profile">
              👤
            </button>
          </div>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ShopAdminDashboard;
