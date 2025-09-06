import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  product?: any;
  mode: 'create' | 'edit';
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  mode
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    category: 'frames',
    brand: '',
    sku: '',
    description: '',
    specifications: {
      frameType: '',
      material: '',
      color: '',
      size: '',
      lensType: '',
      coating: '',
      index: '',
      uvProtection: '',
      polarization: false,
      power: '',
      baseCurve: '',
      diameter: '',
      replacementSchedule: ''
    },
    stockQuantity: 0,
    minStockLevel: 5,
    costPrice: 0,
    sellingPrice: 0,
    supplier: {
      name: '',
      contact: '',
      email: '',
      phone: ''
    },
    images: [] as string[],
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'frames',
        brand: product.brand || '',
        sku: product.sku || '',
        description: product.description || '',
        specifications: {
          frameType: product.specifications?.frameType || '',
          material: product.specifications?.material || '',
          color: product.specifications?.color || '',
          size: product.specifications?.size || '',
          lensType: product.specifications?.lensType || '',
          coating: product.specifications?.coating || '',
          index: product.specifications?.index || '',
          uvProtection: product.specifications?.uvProtection || '',
          polarization: product.specifications?.polarization || false,
          power: product.specifications?.power || '',
          baseCurve: product.specifications?.baseCurve || '',
          diameter: product.specifications?.diameter || '',
          replacementSchedule: product.specifications?.replacementSchedule || ''
        },
        stockQuantity: product.stockQuantity || 0,
        minStockLevel: product.minStockLevel || 5,
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        supplier: {
          name: product.supplier?.name || '',
          contact: product.supplier?.contact || '',
          email: product.supplier?.email || '',
          phone: product.supplier?.phone || ''
        },
        images: product.images || [],
        tags: product.tags || []
      });
    } else {
      setFormData({
        name: '',
        category: 'frames',
        brand: '',
        sku: '',
        description: '',
        specifications: {
          frameType: '',
          material: '',
          color: '',
          size: '',
          lensType: '',
          coating: '',
          index: '',
          uvProtection: '',
          polarization: false,
          power: '',
          baseCurve: '',
          diameter: '',
          replacementSchedule: ''
        },
        stockQuantity: 0,
        minStockLevel: 5,
        costPrice: 0,
        sellingPrice: 0,
        supplier: {
          name: '',
          contact: '',
          email: '',
          phone: ''
        },
        images: [],
        tags: []
      });
    }
    setErrors({});
  }, [mode, product, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else if (name.startsWith('supplier.')) {
      const supplierField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.costPrice <= 0) {
      newErrors.costPrice = 'Cost price must be greater than 0';
    }
    
    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    
    if (formData.sellingPrice <= formData.costPrice) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpecificationFields = () => {
    switch (formData.category) {
      case 'frames':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Frame Type</label>
                <select
                  name="specifications.frameType"
                  value={formData.specifications.frameType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select frame type</option>
                  <option value="full_frame">Full Frame</option>
                  <option value="half_frame">Half Frame</option>
                  <option value="rimless">Rimless</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Material</label>
                <input
                  type="text"
                  name="specifications.material"
                  value={formData.specifications.material}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Metal, Plastic, Titanium"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  name="specifications.color"
                  value={formData.specifications.color}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Black, Brown, Gold"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Size</label>
                <select
                  name="specifications.size"
                  value={formData.specifications.size}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'lenses':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lens Type</label>
                <select
                  name="specifications.lensType"
                  value={formData.specifications.lensType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select lens type</option>
                  <option value="single_vision">Single Vision</option>
                  <option value="bifocal">Bifocal</option>
                  <option value="progressive">Progressive</option>
                  <option value="reading">Reading</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Coating</label>
                <input
                  type="text"
                  name="specifications.coating"
                  value={formData.specifications.coating}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Anti-glare, Blue light"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Index</label>
                <select
                  name="specifications.index"
                  value={formData.specifications.index}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select index</option>
                  <option value="1.5">1.5</option>
                  <option value="1.6">1.6</option>
                  <option value="1.67">1.67</option>
                  <option value="1.74">1.74</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'sunglasses':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">UV Protection</label>
                <select
                  name="specifications.uvProtection"
                  value={formData.specifications.uvProtection}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select UV protection</option>
                  <option value="UV400">UV400</option>
                  <option value="UV380">UV380</option>
                  <option value="UV300">UV300</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Polarization</label>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    name="specifications.polarization"
                    checked={formData.specifications.polarization}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <label className="checkbox-label">Polarized lenses</label>
                </div>
              </div>
            </div>
          </>
        );
      
      case 'contact_lenses':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Power</label>
                <input
                  type="text"
                  name="specifications.power"
                  value={formData.specifications.power}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., -2.50, +1.25"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Base Curve</label>
                <input
                  type="number"
                  name="specifications.baseCurve"
                  value={formData.specifications.baseCurve}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 8.6"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Diameter</label>
                <input
                  type="number"
                  name="specifications.diameter"
                  value={formData.specifications.diameter}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 14.2"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Replacement Schedule</label>
                <select
                  name="specifications.replacementSchedule"
                  value={formData.specifications.replacementSchedule}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select schedule</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="frames">Frames</option>
                  <option value="lenses">Lenses</option>
                  <option value="sunglasses">Sunglasses</option>
                  <option value="contact_lenses">Contact Lenses</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={`form-input ${errors.brand ? 'error' : ''}`}
                  placeholder="Enter brand name"
                />
                {errors.brand && <span className="error-text">{errors.brand}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`form-input ${errors.sku ? 'error' : ''}`}
                  placeholder="Enter SKU"
                />
                {errors.sku && <span className="error-text">{errors.sku}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows={3}
                placeholder="Enter product description"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Specifications</h3>
            {getSpecificationFields()}
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Inventory & Pricing</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Minimum Stock Level</label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cost Price (₹) *</label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  className={`form-input ${errors.costPrice ? 'error' : ''}`}
                  min="0"
                  step="0.01"
                />
                {errors.costPrice && <span className="error-text">{errors.costPrice}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className={`form-input ${errors.sellingPrice ? 'error' : ''}`}
                  min="0"
                  step="0.01"
                />
                {errors.sellingPrice && <span className="error-text">{errors.sellingPrice}</span>}
              </div>
            </div>
            
            {formData.costPrice > 0 && formData.sellingPrice > 0 && (
              <div className="pricing-info">
                <div className="pricing-item">
                  <span className="pricing-label">Margin:</span>
                  <span className="pricing-value">₹{(formData.sellingPrice - formData.costPrice).toFixed(2)}</span>
                </div>
                <div className="pricing-item">
                  <span className="pricing-label">Margin %:</span>
                  <span className="pricing-value">{(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Supplier Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input
                  type="text"
                  name="supplier.name"
                  value={formData.supplier.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  name="supplier.contact"
                  value={formData.supplier.contact}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter contact person"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="supplier.email"
                  value={formData.supplier.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter supplier email"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="supplier.phone"
                  value={formData.supplier.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter supplier phone"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Additional Information</h3>
            
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tags-input-container">
                <div className="tags-display">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => removeTag(tag)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input tags-input"
                  placeholder="Type tags and press Enter or comma"
                  onKeyDown={handleTagInput}
                />
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Add Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
