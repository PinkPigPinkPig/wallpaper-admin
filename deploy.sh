#!/bin/bash

# Deploy script for wallpaper-admin
# This script deploys the application using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting deployment of wallpaper-admin..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images and volumes to ensure fresh build
echo "🧹 Cleaning up old images and volumes..."
docker-compose down --rmi all --volumes --remove-orphans

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up --build -d

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check if the application is running
echo "🔍 Checking application health..."
if curl -f http://localhost:3005 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Application is available at: http://localhost:3005"
    echo "🔗 API endpoint: https://freshness-wallpaper.xyz/api/v1"
else
    echo "❌ Application health check failed. Please check the logs:"
    docker-compose logs
    exit 1
fi

# Show running containers
echo "📋 Running containers:"
docker-compose ps

echo "🎉 Deployment completed successfully!"
