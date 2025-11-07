#!/bin/bash

# Exit on error
set -e

# Kill any running node process
pkill node

# Build the application
npm run build

# Start the server in the background
npm run start:prod > npm_output.log &

# Get the process ID of the server
server_pid=$!

# Wait for the server to start
sleep 10

# Run the Playwright tests
npx playwright test

# Stop the server
kill $server_pid
