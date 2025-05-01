# K-S Enterprise Admin Portal

This is the admin portal for K-S Enterprise, providing comprehensive management functionalities for products, customers, warranties, and system administration.

## Features

- **Service Management**: Add, edit, delete products and categories
- **Customer Management**: Add, edit, delete customers
- **Role Management**: Set roles and permissions for different admin users
- **Warranty Management**: Map products to customers with warranty information
- **Dashboard**: View key metrics and system overview

## Technologies Used

- React with Vite
- TypeScript
- React Router for routing
- Shadcn/UI for UI components
- TailwindCSS for styling
- Zustand for state management
- Axios for API requests
- React Hook Form and Zod for form validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Bun or npm
- Backend API server (from k-s-admin-backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ks-admin-portal
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
VITE_API_URL=http://localhost:3001/api
```

### Running the Application

#### Development Mode
```bash
bun run dev
# or
npm run dev
```

#### Production Build
```bash
bun run build
# or
npm run build
```

## Project Structure

- `src/components/` - React components
  - `layout/` - Layout components like header, sidebar, etc.
  - `pages/` - Page components for each route
  - `shared/` - Shared components used across multiple pages
  - `ui/` - UI components from shadcn/ui
- `src/contexts/` - React contexts for state management
- `src/services/` - API services for backend communication
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and libraries
- `src/types/` - TypeScript type definitions

## Authentication

The app uses JWT-based authentication with the backend. Authentication state is managed via the `AuthContext` which provides:

- Login/logout functionality
- Current user information
- Permission checking for authorization

## Default Login

- Email: `admin@ks-enterprise.com`
- Password: `admin123`

## License

This project is licensed under the MIT License.
