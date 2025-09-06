import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import CustomerModal from './CustomerModal';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  gender: string;
  totalPurchases: number;
  totalSpent: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  shopId?: {
    _id: string;
    name: string;
  };
}

const CustomerManagement: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer statistics
  const fetchCustomerStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setCustomerStats(stats);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  // Modal functions
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:5000/api/customers'
        : `http://localhost:5000/api/customers/${selectedCustomer?._id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        await fetchCustomers(); // Refresh the list
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="customer-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Customer Management</h1>
          <p>
            {isSuperAdmin 
              ? 'Manage customers across all your optical shops.' 
              : 'Manage your shop customers, their prescriptions, and purchase history.'
            }
          </p>
        </div>
        {!isSuperAdmin && (
          <button className="btn btn-primary btn-large" onClick={handleAddCustomer}>
            <span className="btn-icon">➕</span>
            Add New Customer
          </button>
        )}
      </div>

      {/* Customer Statistics */}
      {customerStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Customers</h3>
              <p className="stat-number">{customerStats.totalCustomers}</p>
              <p className="stat-label">All Customers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Customers</h3>
              <p className="stat-number">{customerStats.activeCustomers}</p>
              <p className="stat-label">{customerStats.activePercentage}% Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <h3>New This Month</h3>
              <p className="stat-number">{customerStats.newCustomersThisMonth}</p>
              <p className="stat-label">New Customers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <h3>Upcoming Reminders</h3>
              <p className="stat-number">{customerStats.upcomingReminders}</p>
              <p className="stat-label">Next 30 Days</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary">
              🔍 Search
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading customers...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                {isSuperAdmin && <th>Shop</th>}
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">{customer.name.charAt(0)}</div>
                      <div className="customer-name">{customer.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-phone">{customer.phone}</div>
                      {customer.email && (
                        <div className="contact-email">{customer.email}</div>
                      )}
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div className="shop-info">
                        <span className="shop-name">{customer.shopId?.name || 'N/A'}</span>
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="financial-info">
                      <div className="total-spent">{formatCurrency(customer.totalSpent)}</div>
                      <div className="purchase-count">{customer.totalPurchases} purchases</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!isSuperAdmin && (
                        <button 
                          className="btn btn-small btn-secondary" 
                          title="Edit Customer"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          ✏️
                        </button>
                      )}
                      <button className="btn btn-small btn-info" title="View Details">
                        👁️
                      </button>
                      {!isSuperAdmin && (
                        <button className="btn btn-small btn-danger" title="Delete Customer">
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top Customers Section */}
      {customerStats?.topCustomers && customerStats.topCustomers.length > 0 && (
        <div className="top-customers-section">
          <h3>Top Customers by Revenue</h3>
          <div className="top-customers-grid">
            {customerStats.topCustomers.map((customer: any, index: number) => (
              <div key={customer._id} className="top-customer-card">
                <div className="customer-rank">#{index + 1}</div>
                <div className="customer-details">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-shop">{customer.shopId?.name || 'N/A'}</div>
                  <div className="customer-revenue">{formatCurrency(customer.totalSpent)}</div>
                  <div className="customer-purchases">{customer.totalPurchases} purchases</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        mode={modalMode}
      />
    </div>
  );
};

export default CustomerManagement;
