import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Payment {
  _id: string;
  type: string;
  amount: number;
  paymentMethod: string;
  status: string;
  customerName?: string;
  vendorName?: string;
  description: string;
  paymentDate: string;
  reference?: string;
}

const PaymentAccounting: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentStats, setPaymentStats] = useState<any>(null);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment statistics
  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setPaymentStats(stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="payment-accounting">
      <div className="page-header">
        <div className="header-content">
          <h1>Payment & Accounting</h1>
          <p>Track payments, manage expenses, and maintain financial records for your optical shop.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">💳</span>
          Record Payment
        </button>
      </div>

      {paymentStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Monthly Revenue</h3>
              <p className="stat-number">{formatCurrency(paymentStats.monthlyRevenue)}</p>
              <p className="stat-label">This month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <h3>Monthly Expenses</h3>
              <p className="stat-number">{formatCurrency(paymentStats.monthlyExpenses)}</p>
              <p className="stat-label">This month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Net Profit</h3>
              <p className="stat-number">{formatCurrency(paymentStats.netProfit)}</p>
              <p className="stat-label">Monthly profit</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Payments</h3>
              <p className="stat-number">{paymentStats.pendingPayments}</p>
              <p className="stat-label">{paymentStats.completionRate}% completed</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search payments..." 
              className="search-input"
            />
            <button className="btn btn-secondary">🔍 Search</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td>
                    <div className="transaction-info">
                      <div className="transaction-name">
                        {payment.type === 'customer_payment' ? payment.customerName : payment.vendorName}
                      </div>
                      <div className="transaction-description">{payment.description}</div>
                      {payment.reference && (
                        <div className="transaction-reference">Ref: {payment.reference}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${payment.type}`}>
                      {payment.type === 'customer_payment' ? 'Customer' : 
                       payment.type === 'vendor_payment' ? 'Vendor' : 
                       payment.type === 'expense' ? 'Expense' : 'Income'}
                    </span>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div className="amount">{formatCurrency(payment.amount)}</div>
                    </div>
                  </td>
                  <td>
                    <span className="method-badge">{payment.paymentMethod}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status === 'completed' ? 'Completed' : 
                       payment.status === 'pending' ? 'Pending' : 
                       payment.status === 'failed' ? 'Failed' : 'Cancelled'}
                    </span>
                  </td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-secondary" title="Edit Payment">✏️</button>
                      <button className="btn btn-small btn-info" title="View Details">👁️</button>
                      <button className="btn btn-small btn-primary" title="Print Receipt">🖨️</button>
                      <button className="btn btn-small btn-danger" title="Delete Payment">🗑️</button>
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

export default PaymentAccounting;
