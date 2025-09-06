# Optical Shop Management System - Backend

A comprehensive backend API for managing optical shop operations including customers, products, sales, payments, and multi-shop management.

## Features

- **Multi-shop Management**: Super admin can manage multiple shops
- **Role-based Access Control**: Super admin, shop admin, cashier, optician, accountant roles
- **Customer Management**: Complete customer profiles with prescription history
- **Product Management**: Inventory tracking with low stock alerts
- **Sales & Billing**: Complete sales workflow with invoice generation
- **Payment Processing**: Multiple payment methods with tracking
- **Statistics & Analytics**: Comprehensive reporting and analytics

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd optical-shop-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/optical-shop
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Seed Super Admin** (Optional)
   ```bash
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new user (Super admin only)

### Shops
- `GET /api/shops` - Get all shops (Super admin only)
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create new shop (Super admin only)
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop (Super admin only)
- `GET /api/shops/:id/stats` - Get shop statistics
- `GET /api/shops/stats/overview` - Get overview stats (Super admin only)

### Users
- `GET /api/users` - Get all users (Super admin only)
- `GET /api/users/shop/:shopId` - Get users by shop
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Super admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Super admin only)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/prescriptions` - Add prescription
- `GET /api/customers/stats/overview` - Get customer statistics

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/inventory` - Update inventory
- `GET /api/products/inventory/low-stock` - Get low stock products
- `GET /api/products/stats/overview` - Get product statistics

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/customer/:customerId` - Get payments by customer
- `GET /api/payments/stats/overview` - Get payment statistics

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/customer/:customerId` - Get sales by customer
- `GET /api/sales/stats/overview` - Get sales statistics

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Role Permissions

### Super Admin
- Full access to all resources
- Can manage multiple shops
- Can create/delete users and shops

### Shop Admin
- Full access to their shop's resources
- Can manage customers, products, sales, payments
- Cannot access other shops' data

### Other Roles (Cashier, Optician, Accountant)
- Limited access based on role
- Can view and manage relevant data for their shop

## Database Models

### User
- Authentication and authorization
- Role-based access control
- Shop association

### Shop
- Shop information and settings
- Subscription management
- Admin association

### Customer
- Customer profiles
- Prescription history
- Purchase tracking

### Product
- Product catalog
- Inventory management
- Pricing and specifications

### Payment
- Payment processing
- Multiple payment methods
- Transaction tracking

### Sale
- Sales transactions
- Invoice generation
- Payment status tracking

## Error Handling

The API returns consistent error responses:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed super admin user

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
