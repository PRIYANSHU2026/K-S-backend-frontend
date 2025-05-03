#!/bin/bash

# Start backend server
echo "Starting backend server..."
cd k-s-admin-backend
(bun install && bun run start) &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
sleep 5

# Start frontend server
echo "Starting K-S-Enterprise frontend..."
cd K-S-Enterprise-
(bun install && bun run dev) &
FRONTEND_PID=$!
cd ..

# Start admin portal
echo "Starting admin portal..."
cd ks-admin-portal
(bun install && bun run dev) &
ADMIN_PORTAL_PID=$!
cd ..

# Print access URLs
echo "---------------------------------------"
echo "All services started!"
echo "---------------------------------------"
echo "Backend API:       http://localhost:3001/api/health"
echo "Frontend Website:  http://localhost:3000"
echo "Admin Portal:      http://localhost:5173"
echo "---------------------------------------"
echo "Admin credentials:"
echo "Email:    admin@ks-enterprise.com"
echo "Password: admin123"
echo "---------------------------------------"
echo "Press Ctrl+C to stop all services"

# Handle graceful shutdown
trap "kill $BACKEND_PID $FRONTEND_PID $ADMIN_PORTAL_PID; exit" SIGINT

# Keep script running
wait
