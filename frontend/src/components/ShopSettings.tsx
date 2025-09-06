import React, { useState } from 'react';

const ShopSettings: React.FC = () => {
  const [shopDetails] = useState({
    name: 'Vision Care Optical Shop',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    gst: '27ABCDE1234F1Z5',
    phone: '+91 22 1234 5678',
    email: 'info@visioncare.com',
    website: 'www.visioncare.com',
    businessHours: '9:00 AM - 8:00 PM',
    workingDays: 'Monday to Saturday'
  });

  return (
    <div className="shop-settings">
      <div className="page-header">
        <div className="header-content">
          <h1>Shop Settings</h1>
          <p>Manage your shop details, preferences, and system settings.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">💾</span>
          Save Changes
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>Shop Information</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Shop Name</label>
              <input type="text" value={shopDetails.name} className="form-input" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea value={shopDetails.address} className="form-textarea" rows={3}></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" value={shopDetails.gst} className="form-input" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={shopDetails.phone} className="form-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={shopDetails.email} className="form-input" />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" value={shopDetails.website} className="form-input" />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Business Hours</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Working Hours</label>
              <input type="text" value={shopDetails.businessHours} className="form-input" />
            </div>
            <div className="form-group">
              <label>Working Days</label>
              <input type="text" value={shopDetails.workingDays} className="form-input" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Preferences</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Currency</label>
              <select className="form-select">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Language</label>
              <select className="form-select">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time Zone</label>
              <select className="form-select">
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Low stock alerts</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Customer appointment reminders</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Payment due notifications</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Daily sales reports</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
