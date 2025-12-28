#!/bin/bash

# .devcontainer/setup-env.sh
# Automate environment variable setup for GitHub Codespaces

# Ensure .env exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

echo "Checking for GitHub Secrets in environment..."

# List of common keys from .env.example
KEYS=(
  "DATABASE_URL"
  "BETTER_AUTH_SECRET"
  "BETTER_AUTH_URL"
  "AUTH_GOOGLE_ID"
  "AUTH_GOOGLE_SECRET"
  "NEXT_PUBLIC_APP_URL"
  "NEXT_PUBLIC_API_HOST"
  "SEED_ADMIN_PASSWORD"
  "ADMIN_PASSWORD"
)

# For each key, if it exists in the shell environment, update/add to .env
for key in "${KEYS[@]}"; do
  # Get value from environment
  val="${!key}"
  
  if [ ! -z "$val" ]; then
    # Escape value for sed if it contains / or & (common in DB URLs)
    escaped_val=$(echo "$val" | sed 's/[\/&]/\\&/g')
    
    # Check if key exists in .env
    if grep -q "^$key=" .env; then
      # Update existing key
      sed -i "s/^$key=.*/$key=\"$escaped_val\"/" .env
      echo "Updated $key in .env from environment secret."
    else
      # Append new key
      echo "$key=\"$val\"" >> .env
      echo "Added $key to .env from environment secret."
    fi
  fi
done

echo "Environment setup complete."
