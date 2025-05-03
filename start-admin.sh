#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "${BLUE}=====================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}=====================================================${NC}"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print info messages
print_info() {
  echo -e "${YELLOW}i $1${NC}"
}

# Starting project directory
PROJECT_DIR="$(pwd)/K-S-backend-frontend"

# Change to the project directory
cd "$PROJECT_DIR" || { print_error "Failed to change to project directory"; exit 1; }

# Set up backend environment
print_header "Setting up backend environment"
cd k-s-admin-backend || { print_error "Failed to change to backend directory"; exit 1; }

print_info "Installing backend dependencies..."
bun install || { print_error "Failed to install backend dependencies"; exit 1; }

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  print_success "Created .env file from example"
else
  print_info ".env file already exists"
fi

# Create uploads directory
mkdir -p public/uploads
print_success "Backend environment setup complete"

# Start backend server
print_header "Starting backend server"
print_info "Starting backend on port 3001..."
bun run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to initialize (health check)
MAX_ATTEMPTS=10
ATTEMPT=0
print_info "Waiting for backend to start (up to ${MAX_ATTEMPTS} attempts)..."

until curl -s http://localhost:3001/api/health > /dev/null || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
  echo -n "."
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  print_error "Backend server failed to start. Check backend.log for details."
  kill $BACKEND_PID
  exit 1
fi

print_success "Backend server started successfully!"

# Set up admin portal
cd "$PROJECT_DIR/ks-admin-portal" || { print_error "Failed to change to admin portal directory"; exit 1; }
print_header "Setting up admin portal environment"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "VITE_API_URL=http://localhost:3001/api" > .env
  print_success "Created .env file"
else
  print_info ".env file already exists"
fi

print_info "Installing admin portal dependencies..."
bun install || { print_error "Failed to install admin portal dependencies"; exit 1; }

# Start admin portal
print_header "Starting admin portal"
bun run dev > admin.log 2>&1 &
ADMIN_PORTAL_PID=$!
print_success "Admin portal started on port 5173"

# Print access information
print_header "All services started successfully!"
echo -e "Backend API:  ${GREEN}http://localhost:3001/api/health${NC}"
echo -e "Admin Portal: ${GREEN}http://localhost:5173${NC}"
echo
echo -e "${YELLOW}Default admin credentials:${NC}"
echo -e "Email:    ${GREEN}admin@ks-enterprise.com${NC}"
echo -e "Password: ${GREEN}admin123${NC}"
echo
echo -e "${YELLOW}Log files:${NC}"
echo -e "Backend: ${BLUE}$PROJECT_DIR/k-s-admin-backend/backend.log${NC}"
echo -e "Admin:   ${BLUE}$PROJECT_DIR/ks-admin-portal/admin.log${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Handle graceful shutdown
trap "echo -e '${YELLOW}Stopping all services...${NC}'; kill $BACKEND_PID $ADMIN_PORTAL_PID; echo -e '${GREEN}All services stopped${NC}'; exit" SIGINT

# Keep script running
wait
