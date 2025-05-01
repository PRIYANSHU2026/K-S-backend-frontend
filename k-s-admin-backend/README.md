# K-S Enterprise Admin Backend

This is the backend API for the K-S Enterprise Admin Portal. It provides RESTful endpoints for managing products, customers, warranties, users, and roles.

## Features

- **Service Management**: Add, edit, delete products and categories
- **Customer Management**: Add, edit, delete customers
- **Role Management**: Set roles for admin like super admin with different permissions
- **Warranty Management**: Map products to customers with warranty information

## Technologies Used

- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT) for authentication
- Multer for file uploads
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or bun

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd k-s-admin-backend
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ks_enterprise
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# File Upload
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
```

## Running the Application

### Development Mode
```bash
npm run dev
# or
bun run dev
```

### Production Mode
```bash
npm start
# or
bun start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category
- `GET /api/categories/:id/products` - Get products by category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a single customer
- `GET /api/customers/:id/warranties` - Get warranties by customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Warranties
- `GET /api/warranties` - Get all warranties
- `GET /api/warranties/expiring` - Get expiring warranties
- `PUT /api/warranties/update-statuses` - Update all warranty statuses
- `GET /api/warranties/:id` - Get a single warranty
- `POST /api/warranties` - Create a new warranty
- `PUT /api/warranties/:id` - Update a warranty
- `DELETE /api/warranties/:id` - Delete a warranty

### Roles
- `GET /api/roles/permissions/available` - Get available permissions
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get a single role
- `GET /api/roles/:id/users` - Get users by role
- `POST /api/roles` - Create a new role
- `PUT /api/roles/:id` - Update a role
- `DELETE /api/roles/:id` - Delete a role

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Default Login

The system is initialized with a default super admin user:

- Email: `admin@ks-enterprise.com`
- Password: `admin123`

**Note**: Change the default password after first login.

## License

This project is licensed under the MIT License.
