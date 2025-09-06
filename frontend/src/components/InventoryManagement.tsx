import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  sku: string;
  stockQuantity: number;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  isActive: boolean;
  margin: number;
  marginPercentage: number;
  totalValue: number;
  stockStatus: string;
}

const InventoryManagement: React.FC = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [productStats, setProductStats] = useState<any>(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product statistics
  const fetchProductStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setProductStats(stats);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStockStatus = (product: any) => {
    if (product.stockQuantity === 0) return 'out-of-stock';
    if (product.stockQuantity <= product.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="inventory-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Inventory & Stock Management</h1>
          <p>Manage your optical products, track stock levels, and monitor inventory value.</p>
        </div>
        <button className="btn btn-primary btn-large">
          <span className="btn-icon">➕</span>
          Add New Product
        </button>
      </div>

      {/* Inventory Statistics */}
      {productStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Products</h3>
              <p className="stat-number">{productStats.totalProducts}</p>
              <p className="stat-label">{productStats.activePercentage}% Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>Low Stock Items</h3>
              <p className="stat-number">{productStats.lowStockProducts}</p>
              <p className="stat-label">Need attention</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Out of Stock</h3>
              <p className="stat-number">{productStats.outOfStockProducts}</p>
              <p className="stat-label">Need restocking</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Value</h3>
              <p className="stat-number">{formatCurrency(productStats.totalValue)}</p>
              <p className="stat-label">Inventory worth</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div className="table-actions">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-secondary">🔍 Search</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Margin</th>
                <th>Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-info">
                      <div className="product-avatar">{product.name.charAt(0)}</div>
                      <div className="product-details">
                        <div className="product-name">{product.name}</div>
                        <div className="product-brand">{product.brand}</div>
                        <div className="product-sku">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>
                    <div className="stock-info">
                      <div className="stock-quantity">{product.stockQuantity} pieces</div>
                      <div className="stock-levels">
                        Min: {product.minStockLevel}
                      </div>
                    </div>
                  </td>
                  <td>{formatCurrency(product.costPrice)}</td>
                  <td>{formatCurrency(product.sellingPrice)}</td>
                  <td>
                    <div className="margin-info">
                      <div className="margin-amount">{formatCurrency(product.margin || 0)}</div>
                      <div className="margin-percentage">{product.marginPercentage || 0}%</div>
                    </div>
                  </td>
                  <td>{formatCurrency(product.costPrice * product.stockQuantity)}</td>
                  <td>
                    <span className={`status-badge ${getStockStatus(product)}`}>
                      {getStockStatus(product) === 'out-of-stock' ? 'Out of Stock' : 
                       getStockStatus(product) === 'low-stock' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-secondary" title="Edit Product">✏️</button>
                      <button className="btn btn-small btn-info" title="View Details">👁️</button>
                      <button className="btn btn-small btn-primary" title="Add Stock">📦</button>
                      <button className="btn btn-small btn-danger" title="Delete Product">🗑️</button>
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

export default InventoryManagement;
