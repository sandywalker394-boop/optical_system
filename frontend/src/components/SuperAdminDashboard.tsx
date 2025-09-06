import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import CreateShopModal from './CreateShopModal';
import CustomerManagement from './CustomerManagement';

interface Shop {
  _id: string;
  name: string;
  address: string;
  gst: string;
  phone: string;
  email: string;
  adminId: string;
  isActive: boolean;
  subscription: {
    plan: string;
    isActive: boolean;
  };
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  shopId?: string;
  isActive: boolean;
}

interface Pagination {
  current: number;
  total: number;
  totalShops: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SuperAdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Shop management states
  const [shopPagination, setShopPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    totalShops: 0,
    hasNext: false,
    hasPrev: false
  });
  const [shopSearch, setShopSearch] = useState('');
  const [shopPlanFilter, setShopPlanFilter] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState('');
  const [shopStats, setShopStats] = useState<any>(null);

  // Fetch shops from API with pagination and filters
  const fetchShops = async (page = 1, search = '', plan = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        plan,
        status
      });

      const response = await fetch(`http://localhost:5000/api/shops?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShops(data.shops);
        setShopPagination(data.pagination);
      } else {
        console.error('Failed to fetch shops');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shop statistics
  const fetchShopStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shops/stats/overview', {
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
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Create new shop
  const handleCreateShop = async (shopData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/shops', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopData)
      });

      if (response.ok) {
        const result = await response.json();
        setShops(prev => [result.shop, ...prev]);
        fetchShopStats(); // Refresh stats
        alert('Shop created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  };

  // Delete shop
  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setShops(prev => prev.filter(shop => shop._id !== shopId));
        fetchShopStats(); // Refresh stats
        alert('Shop deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Error deleting shop');
    }
  };

  // Toggle shop status
  const handleToggleShopStatus = async (shopId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/shops/${shopId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setShops(prev => prev.map(shop => 
          shop._id === shopId ? result.shop : shop
        ));
        fetchShopStats(); // Refresh stats
        alert(result.message);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error toggling shop status:', error);
      alert('Error updating shop status');
    }
  };

  // Handle search and filters
  const handleSearch = () => {
    fetchShops(1, shopSearch, shopPlanFilter, shopStatusFilter);
  };

  const handleFilterChange = () => {
    fetchShops(1, shopSearch, shopPlanFilter, shopStatusFilter);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchShops(page, shopSearch, shopPlanFilter, shopStatusFilter);
  };

  useEffect(() => {
    fetchShops();
    fetchUsers();
    fetchShopStats();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your optical business.</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Total Shops</h3>
            <p className="stat-number">{shopStats?.totalShops || 0}</p>
            <p className="stat-label">Active Shops</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
            <p className="stat-label">Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Active Rate</h3>
            <p className="stat-number">{shopStats?.activePercentage || 0}%</p>
            <p className="stat-label">Shops Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Recent Shops</h3>
            <p className="stat-number">{shopStats?.recentShops || 0}</p>
            <p className="stat-label">Last 7 Days</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => setShowCreateShop(true)}>
            <span className="action-icon">➕</span>
            <span>Add New Shop</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Generate Report</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">👤</span>
            <span>Add User</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🏪</div>
            <div className="activity-content">
              <span className="activity-text">New shop "Vision Plus - South" registered</span>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <span className="activity-text">User "Mike Johnson" created in Main Branch</span>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📊</div>
            <div className="activity-content">
              <span className="activity-text">Monthly report generated for all shops</span>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderShopManagement = () => (
    <div className="shop-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Shop Management</h1>
          <p>Manage all your optical shops and their configurations.</p>
        </div>
        <button 
          className="btn btn-primary btn-large"
          onClick={() => setShowCreateShop(true)}
        >
          <span className="btn-icon">➕</span>
          Add New Shop
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <div className="search-filter-group">
              <input 
                type="text" 
                placeholder="Search shops..." 
                className="search-input"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn btn-secondary" onClick={handleSearch}>
                🔍 Search
              </button>
            </div>
            <select 
              className="filter-select"
              value={shopPlanFilter}
              onChange={(e) => {
                setShopPlanFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select 
              className="filter-select"
              value={shopStatusFilter}
              onChange={(e) => {
                setShopStatusFilter(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading shops...</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Address</th>
                  <th>GST</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map(shop => (
                  <tr key={shop._id}>
                    <td>
                      <div className="shop-info">
                        <div className="shop-name">{shop.name}</div>
                      </div>
                    </td>
                    <td>{shop.address}</td>
                    <td>{shop.gst}</td>
                    <td>{shop.phone}</td>
                    <td>{shop.email}</td>
                    <td>
                      <span className={`plan-badge ${shop.subscription.plan}`}>
                        {shop.subscription.plan}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${shop.isActive ? 'active' : 'inactive'}`}>
                        {shop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-small btn-secondary" 
                          title="Edit Shop"
                          onClick={() => alert('Edit functionality coming soon')}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-small btn-info" 
                          title="Toggle Status"
                          onClick={() => handleToggleShopStatus(shop._id)}
                        >
                          {shop.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button 
                          className="btn btn-small btn-danger" 
                          onClick={() => handleDeleteShop(shop._id)}
                          title="Delete Shop"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {shopPagination.total > 1 && (
              <div className="pagination">
                <button 
                  className="btn btn-secondary"
                  disabled={!shopPagination.hasPrev}
                  onClick={() => handlePageChange(shopPagination.current - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {shopPagination.current} of {shopPagination.total}
                </span>
                <button 
                  className="btn btn-secondary"
                  disabled={!shopPagination.hasNext}
                  onClick={() => handlePageChange(shopPagination.current + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage all users across your optical shops.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">➕</span>
          Add New User
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
            />
            <select className="filter-select">
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="shop_admin">Shop Admin</option>
              <option value="cashier">Cashier</option>
              <option value="optician">Optician</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Shop</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div className="user-name">{user.name}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td>{shops.find(s => s._id === user.shopId)?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-small btn-secondary" title="Edit User">
                      ✏️
                    </button>
                    <button className="btn btn-small btn-danger" title="Delete User">
                      🗑️
                    </button>
                    <button className="btn btn-small btn-info" title="View Details">
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`super-admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">👓</span>
            {!sidebarCollapsed && <span className="logo-text">OpticalMS</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span className="nav-text">Dashboard</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            <span className="nav-icon">🏪</span>
            {!sidebarCollapsed && <span className="nav-text">Shop Management</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <span className="nav-icon">👥</span>
            {!sidebarCollapsed && <span className="nav-text">Customer Management</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👤</span>
            {!sidebarCollapsed && <span className="nav-text">User Management</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="nav-icon">📈</span>
            {!sidebarCollapsed && <span className="nav-text">Reports</span>}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            {!sidebarCollapsed && <span className="nav-text">Settings</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Super Admin</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h2 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'shops' && 'Shop Management'}
              {activeTab === 'customers' && 'Customer Management'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'reports' && 'Reports & Analytics'}
              {activeTab === 'settings' && 'System Settings'}
            </h2>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">🔔</button>
              <button className="profile-btn">{user?.name?.charAt(0)}</button>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'shops' && renderShopManagement()}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'reports' && (
            <div className="reports-section">
              <div className="page-header">
                <h1>Reports & Analytics</h1>
                <p>Generate detailed reports and view analytics.</p>
              </div>
              <div className="coming-soon">
                <div className="coming-soon-icon">📊</div>
                <h3>Reports Coming Soon</h3>
                <p>Advanced reporting and analytics features will be available soon.</p>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="page-header">
                <h1>System Settings</h1>
                <p>Configure system preferences and settings.</p>
              </div>
              <div className="coming-soon">
                <div className="coming-soon-icon">⚙️</div>
                <h3>Settings Coming Soon</h3>
                <p>System configuration options will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateShopModal
        isOpen={showCreateShop}
        onClose={() => setShowCreateShop(false)}
        onSubmit={handleCreateShop}
      />
    </div>
  );
};

export default SuperAdminDashboard;
