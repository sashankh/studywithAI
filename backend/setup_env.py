#!/usr/bin/env python3
import json
import os
import sys

def setup_env_from_vercel_deploy():
    """
    Extract environment variables from vercel-deploy.json and write them to a .env file
    for use in development environments like GitHub Codespaces.
    """
    # Determine if we're in GitHub Codespaces
    in_codespaces = os.environ.get('CODESPACES') == 'true'
    
    print(f"{'Running in GitHub Codespaces' if in_codespaces else 'Running in local environment'}")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to vercel-deploy.json
    vercel_deploy_path = os.path.join(script_dir, 'vercel-deploy.json')
    
    # Path to .env file
    env_file_path = os.path.join(script_dir, '.env')
    
    # Check if vercel-deploy.json exists
    if not os.path.exists(vercel_deploy_path):
        print(f"Error: {vercel_deploy_path} not found")
        return False
    
    # Read vercel-deploy.json
    try:
        with open(vercel_deploy_path, 'r') as f:
            vercel_config = json.load(f)
    except Exception as e:
        print(f"Error reading vercel-deploy.json: {e}")
        return False
    
    # Extract environment variables
    if 'env' not in vercel_config:
        print("No environment variables found in vercel-deploy.json")
        return False
    
    env_vars = vercel_config['env']
    
    # Create .env file content
    env_content = [
        "# Environment variables generated from vercel-deploy.json",
        "# Generated automatically - DO NOT COMMIT THIS FILE",
        ""
    ]
    
    # Add variables from vercel-deploy.json
    for key, value in env_vars.items():
        env_content.append(f"{key}={value}")
    
    # Add some additional variables that might be useful
    env_content.extend([
        "",
        "# Additional settings",
        "LOG_LEVEL=DEBUG",
        "LLM_PROVIDER=azure"
    ])
    
    # Write to .env file
    try:
        with open(env_file_path, 'w') as f:
            f.write('\n'.join(env_content))
        print(f"Successfully created .env file at {env_file_path}")
        return True
    except Exception as e:
        print(f"Error writing .env file: {e}")
        return False

if __name__ == "__main__":
    success = setup_env_from_vercel_deploy()
    sys.exit(0 if success else 1)