#!/bin/bash

# Script to symlink .env file from root to packages directories

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_ENV_FILE="$SCRIPT_DIR/../.env"

# Target directories
PACKAGES=("packages/api" "packages/admin" "packages/map")

if [ ! -f "$ROOT_ENV_FILE" ]; then
    echo "Error: .env file not found in root directory: $ROOT_ENV_FILE"
    exit 1
fi

echo "Found .env file at: $ROOT_ENV_FILE"
echo "Creating symlinks..."

for package in "${PACKAGES[@]}"; do
    PACKAGE_DIR="$SCRIPT_DIR/../$package"
    TARGET_ENV="$PACKAGE_DIR/.env"
    
    if [ ! -d "$PACKAGE_DIR" ]; then
        echo "Warning: Package directory does not exist: $PACKAGE_DIR"
        continue
    fi
    
    if [ -e "$TARGET_ENV" ] || [ -L "$TARGET_ENV" ]; then
        echo "  Removing existing .env in $package"
        rm "$TARGET_ENV"
    fi
    
    cd "$PACKAGE_DIR"
    ln -s "../../.env" ".env"
    cd "$SCRIPT_DIR"
    
    echo "  ✓ Created symlink: $package/.env -> ../../.env"
done
