# K-S Enterprise System

A complete system for K-S Enterprise consisting of three components:
1. **K-S-Enterprise-** - Public website for customers (Next.js)
2. **k-s-admin-backend** - Backend API server (Node.js/Express)
3. **ks-admin-portal** - Admin dashboard for managing content, products, etc. (React/Vite)

## Quick Start

The easiest way to run the entire system is to use the included startup script:

```bash
./start-project.sh
```

This script will:
- Install dependencies for all components
- Set up necessary environment files
- Start all three services (backend, website, and admin portal)
- Show you the URLs to access each component

## Manual Setup

If you prefer to set up components individually:

### 1. Backend Setup

```bash
cd k-s-admin-backend
bun install
node initialize-dev.js
bun run dev
```

The backend will run on port 3001 by default.

### 2. Public Website Setup

```bash
cd K-S-Enterprise-
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
bun install
bun run dev
```

The website will run on port 3000 by default.

### 3. Admin Portal Setup

```bash
cd ks-admin-portal
echo "VITE_API_URL=http://localhost:3001/api" > .env
bun install
bun run dev
```

The admin portal will run on port 5173 by default.

## Admin Login

Use these credentials to log into the admin portal:
- Email: `admin@ks-enterprise.com`
- Password: `admin123`

## System Architecture

The system has the following architecture:

```
┌───────────────────┐       ┌────────────────────┐      ┌────────────────────┐
│                   │       │                    │      │                    │
│  K-S-Enterprise   │       │  k-s-admin-backend │      │  ks-admin-portal   │
│  (Next.js)        │◄──────┤  (Node.js/Express) ├─────►│  (React)           │
│  Public Website   │       │  API Server        │      │  Admin Dashboard   │
│                   │       │                    │      │                    │
└───────────────────┘       └────────────────────┘      └────────────────────┘
```

## Key Features

1. **Public Website**
   - Display products by category
   - Contact form
   - Dynamic content managed via admin portal

2. **Backend API**
   - RESTful API endpoints for CRUD operations
   - Authentication and authorization
   - Image uploads and management

3. **Admin Portal**
   - Content management
   - Product and category management
   - Customer and warranty management
   - User authentication with role-based access control

## Troubleshooting

If you encounter any issues:

1. **Backend Not Starting**:
   - Check if port 3001 is already in use
   - Verify .env file configuration
   - Check backend.log for errors

2. **Frontend/Admin Portal Connection Issues**:
   - Verify that the backend server is running
   - Check the URL in .env files
   - Try restarting the problematic service

3. **Database Issues**:
   - In development mode, the system uses a local in-memory database
   - For production, configure proper MySQL credentials in .env

## License

This project is proprietary to K-S Enterprise.
