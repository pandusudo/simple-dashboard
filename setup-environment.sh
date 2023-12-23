#!/bin/bash

# Copy .env.example to .env
cp .env.example .env

# Default values
default_user="postgres"
default_password="postgres"
default_host="localhost"
default_port="5432"
default_db_name="mydatabase"

# User input for database configuration
read -p "Enter database user (default: $default_user): " db_user
db_user=${db_user:-$default_user} # Set default if user enters nothing
read -s -p "Enter database password (default: $default_password): " db_password
echo # New line after password input
db_password=${db_password:-$default_password} # Set default if user enters nothing
read -p "Enter database host (default: $default_host): " db_host
db_host=${db_host:-$default_host} # Set default if user enters nothing
read -p "Enter database port (default: $default_port): " db_port
db_port=${db_port:-$default_port} # Set default if user enters nothing
read -p "Enter database name (default: $default_db_name): " db_name
db_name=${db_name:-$default_db_name} # Set default if user enters nothing

# Create DATABASE_URL string
db_url="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"

# Update .env file with DATABASE_URL
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" .env

echo "Configuration complete. DATABASE_URL set to: ${db_url}"
