#!/bin/bash

# This script handles the build process for Vercel deployment
# It specifically addresses the PyYAML license classifier deprecation warning

# Set environment variable to ignore deprecation warnings
export PYTHONWARNINGS="ignore::DeprecationWarning"

# Install dependencies with pip
pip install -r requirements.txt

# Print success message
echo "Build completed successfully"