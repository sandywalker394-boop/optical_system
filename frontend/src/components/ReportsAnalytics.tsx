import React from 'react';

const ReportsAnalytics: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="reports-analytics">
      <div className="page-header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p>View detailed reports, analyze business performance, and track key metrics.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">📊</span>
          Export Report
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-number">₹2,45,000</p>
            <p className="stat-label">+15% from last month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>New Customers</h3>
            <p className="stat-number">45</p>
            <p className="stat-label">This month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>Repeat Customers</h3>
            <p className="stat-number">78%</p>
            <p className="stat-label">Customer retention</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Top Product</h3>
            <p className="stat-number">Ray-Ban Aviator</p>
            <p className="stat-label">Best seller</p>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h3>Sales Reports</h3>
        <div className="reports-grid">
          <div className="report-card">
            <h4>Daily Sales Report</h4>
            <p>Track daily sales performance and trends</p>
            <button className="btn btn-secondary">View Report</button>
          </div>
          <div className="report-card">
            <h4>Monthly Sales Report</h4>
            <p>Comprehensive monthly sales analysis</p>
            <button className="btn btn-secondary">View Report</button>
          </div>
          <div className="report-card">
            <h4>Customer Analytics</h4>
            <p>Customer behavior and preferences analysis</p>
            <button className="btn btn-secondary">View Report</button>
          </div>
          <div className="report-card">
            <h4>Inventory Report</h4>
            <p>Stock levels and inventory valuation</p>
            <button className="btn btn-secondary">View Report</button>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h3>Business Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Revenue Trends</h4>
            <div className="chart-placeholder">
              <p>📊 Revenue Chart</p>
              <p>Monthly revenue trends will be displayed here</p>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Customer Growth</h4>
            <div className="chart-placeholder">
              <p>📈 Growth Chart</p>
              <p>Customer acquisition trends will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
