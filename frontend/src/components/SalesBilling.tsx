import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Sale {
  _id: string;
  saleNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  saleDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const SalesBilling: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [salesStats, setSalesStats] = useState<any>(null);

  // Fetch sales from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/sales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
      } else {
        console.error('Failed to fetch sales');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales statistics
  const fetchSalesStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setSalesStats(stats);
      }
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchSalesStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="sales-billing">
      <div className="page-header">
        <div className="header-content">
          <h1>Sales & Billing</h1>
          <p>Create invoices, track sales, and manage billing for your optical shop.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">💰</span>
          New Sale
        </button>
      </div>

      {salesStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Monthly Revenue</h3>
              <p className="stat-number">{formatCurrency(salesStats.monthlyRevenue)}</p>
              <p className="stat-label">This month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Total Sales</h3>
              <p className="stat-number">{salesStats.totalSales}</p>
              <p className="stat-label">All time</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Paid Sales</h3>
              <p className="stat-number">{salesStats.paidSales}</p>
              <p className="stat-label">{salesStats.paymentCompletionRate}% completion rate</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Amount</h3>
              <p className="stat-number">{formatCurrency(salesStats.totalDue)}</p>
              <p className="stat-label">{salesStats.pendingSales} sales pending</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="search-input"
            />
            <button className="btn btn-secondary">🔍 Search</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading sales...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale Number</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Paid/Due</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>
                    <div className="invoice-info">
                      <div className="invoice-number">{sale.saleNumber}</div>
                    </div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{sale.customerName}</div>
                      <div className="customer-phone">{sale.customerPhone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="items-info">
                      <div className="items-count">{sale.items.length} items</div>
                      <div className="items-preview">
                        {sale.items.slice(0, 2).map((item, index) => (
                          <span key={index} className="item-name">
                            {item.productName} ({item.quantity}x)
                          </span>
                        ))}
                        {sale.items.length > 2 && (
                          <span className="more-items">+{sale.items.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div className="amount">{formatCurrency(sale.totalAmount)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="payment-info">
                      <div className="paid-amount">Paid: {formatCurrency(sale.paidAmount)}</div>
                      {sale.dueAmount > 0 && (
                        <div className="due-amount">Due: {formatCurrency(sale.dueAmount)}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${sale.paymentStatus}`}>
                      {sale.paymentStatus === 'paid' ? 'Paid' : 
                       sale.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-secondary" title="Edit Sale">✏️</button>
                      <button className="btn btn-small btn-info" title="View Details">👁️</button>
                      <button className="btn btn-small btn-primary" title="Print Invoice">🖨️</button>
                      <button className="btn btn-small btn-danger" title="Delete Sale">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesBilling;
