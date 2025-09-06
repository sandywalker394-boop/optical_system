# Optical Shop Management System

A comprehensive optical shop management system built with React (TypeScript) frontend and Node.js/Express backend with MongoDB.

## Features

### 🏢 Multi-Shop Management
- **Super Admin**: Manage multiple optical shops
- **Shop Admin**: Manage individual shop operations
- **Role-based Access Control**: Different permissions for different user types

### 👥 Customer Management
- Complete customer profiles with contact information
- Prescription management with eye measurements
- Customer purchase history and spending analytics
- Customer categorization and tagging

### 📦 Inventory Management
- Product catalog with categories (frames, lenses, sunglasses, etc.)
- Stock level tracking with low-stock alerts
- Cost and selling price management
- Margin calculations and profit tracking
- Supplier information management

### 💰 Sales & Billing
- Create sales transactions with multiple items
- Automatic invoice generation with unique sale numbers
- Payment tracking (paid, partial, pending)
- Tax calculations (GST support)
- Delivery status tracking

### 💳 Payment & Accounting
- Multiple payment methods (cash, card, UPI, bank transfer)
- Customer and vendor payment tracking
- Expense management with categories
- Financial reporting and analytics
- Payment status tracking

### 📊 Dashboard & Analytics
- Real-time shop statistics
- Revenue and profit tracking
- Customer analytics
- Inventory value calculations
- Performance metrics

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **CSS3** with modern styling
- **Responsive Design** for mobile and desktop

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **RESTful API** design
- **Role-based middleware**

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Eye-Glass
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/optical-management
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

6. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Default Login Credentials

The system automatically creates a super admin account:

- **Email**: admin@optical.com
- **Password**: admin123

## User Roles

### Super Admin
- Manage multiple shops
- Create shop admin accounts
- View system-wide analytics
- Manage subscriptions and plans

### Shop Admin
- Manage shop customers
- Handle inventory and stock
- Process sales and billing
- Track payments and accounting
- View shop-specific analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (Super Admin only)
- `GET /api/auth/me` - Get current user

### Shops
- `GET /api/shops` - Get all shops (Super Admin only)
- `POST /api/shops` - Create new shop (Super Admin only)
- `GET /api/shops/:id/stats` - Get shop statistics

### Customers
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer (Shop Admin only)
- `PUT /api/customers/:id` - Update customer (Shop Admin only)
- `DELETE /api/customers/:id` - Delete customer (Shop Admin only)

### Products
- `GET /api/products` - Get products
- `POST /api/products` - Create product (Shop Admin only)
- `PUT /api/products/:id` - Update product (Shop Admin only)
- `PATCH /api/products/:id/stock` - Update stock (Shop Admin only)

### Sales
- `GET /api/sales` - Get sales
- `POST /api/sales` - Create sale (Shop Admin only)
- `PUT /api/sales/:id` - Update sale (Shop Admin only)

### Payments
- `GET /api/payments` - Get payments
- `POST /api/payments` - Record payment (Shop Admin only)
- `PUT /api/payments/:id` - Update payment (Shop Admin only)

## Database Schema

### Users
- Authentication and role management
- Shop association for non-super admin users

### Shops
- Shop information and settings
- Subscription plan management

### Customers
- Customer profiles and contact information
- Prescription data
- Purchase history

### Products
- Product catalog with specifications
- Stock management
- Pricing and margin calculations

### Sales
- Sales transactions with items
- Payment tracking
- Delivery management

### Payments
- Payment records
- Multiple payment methods
- Transaction tracking

## Features in Development

- [ ] Customer prescription management modal
- [ ] Product management modal
- [ ] Payment recording modal
- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] Mobile app
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for optical shop management**
