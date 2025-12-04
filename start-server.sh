#!/bin/bash
echo "Starting local server..."
echo ""
echo "Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
cd front
python3 -m http.server 8000

