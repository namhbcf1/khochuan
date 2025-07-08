#!/bin/bash

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build the application
npm run build

# Copy the dist directory to the root for Cloudflare Pages
cp -r dist/* ../ 