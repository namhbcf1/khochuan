#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting build process..."

# Navigate to frontend directory
cd frontend
echo "Changed directory to frontend"

# Install dependencies
echo "Installing dependencies..."
npm install --include=dev
echo "Installing terser explicitly..."
npm install --save-dev terser
echo "Dependencies installed successfully"

# Build the application
echo "Building the application..."
npm run build
echo "Build completed successfully"

# Copy the dist directory to the root for Cloudflare Pages
echo "Copying build files to root directory..."
mkdir -p ../dist
cp -r dist/* ../dist/
echo "Files copied successfully"

echo "Build process completed successfully" 