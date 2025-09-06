import React, { useState } from 'react';

const StaffManagement: React.FC = () => {
  const [staff] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@opticshop.com',
      role: 'optician',
      phone: '+91 98765 43210',
      isActive: true,
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@opticshop.com',
      role: 'cashier',
      phone: '+91 98765 43211',
      isActive: true,
      joinDate: '2023-03-20'
    }
  ]);

  return (
    <div className="staff-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Staff & User Roles</h1>
          <p>Manage your shop staff, assign roles, and control access permissions.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">👨‍💼</span>
          Add Staff Member
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Staff</h3>
            <p className="stat-number">8</p>
            <p className="stat-label">Active members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>Opticians</h3>
            <p className="stat-number">3</p>
            <p className="stat-label">Eye care specialists</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Cashiers</h3>
            <p className="stat-number">2</p>
            <p className="stat-label">Sales staff</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Accountants</h3>
            <p className="stat-number">1</p>
            <p className="stat-label">Financial management</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search staff..." 
              className="search-input"
            />
            <button className="btn btn-secondary">🔍 Search</button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">{member.name.charAt(0)}</div>
                    <div className="staff-details">
                      <div className="staff-name">{member.name}</div>
                      <div className="staff-email">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${member.role}`}>
                    {member.role === 'optician' ? 'Optician' : 
                     member.role === 'cashier' ? 'Cashier' : 
                     member.role === 'accountant' ? 'Accountant' : member.role}
                  </span>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-phone">{member.phone}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{member.joinDate}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-small btn-secondary" title="Edit Staff">✏️</button>
                    <button className="btn btn-small btn-info" title="View Details">👁️</button>
                    <button className="btn btn-small btn-primary" title="Manage Permissions">🔐</button>
                    <button className="btn btn-small btn-danger" title="Remove Staff">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
