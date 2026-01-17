# Docker Setup Guide

This guide will help you build and run a Docker image from the backend zip file.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)
- The `server.zip` file in the project root

## Building the Docker Image

### Option 1: Using Docker CLI

1. **Build the image:**
   ```bash
   docker build -t real-estate-backend:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e MONGODB_URI="your_mongodb_connection_string" \
     -e JWT_SECRET="your_jwt_secret" \
     -e RAZORPAY_KEY_ID="your_razorpay_key_id" \
     -e RAZORPAY_KEY_SECRET="your_razorpay_key_secret" \
     -v $(pwd)/uploads:/app/uploads \
     -v $(pwd)/excel-data:/app/excel-data \
     --name real-estate-backend \
     real-estate-backend:latest
   ```

3. **Check if the container is running:**
   ```bash
   docker ps
   ```

4. **View container logs:**
   ```bash
   docker logs real-estate-backend
   ```

### Option 2: Using Docker Compose (Recommended)

1. **Create a `.env` file in the project root with your environment variables:**
   ```bash
   cp .env.docker.example .env
   ```
   Then edit the `.env` file with your actual credentials.

2. **Build and start the container:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop the container:**
   ```bash
   docker-compose down
   ```

## Managing the Docker Container

### Stop the container:
```bash
docker stop real-estate-backend
```

### Start the container:
```bash
docker start real-estate-backend
```

### Remove the container:
```bash
docker rm real-estate-backend
```

### Remove the image:
```bash
docker rmi real-estate-backend:latest
```

### Execute commands inside the container:
```bash
docker exec -it real-estate-backend sh
```

## Pushing to Docker Hub (Optional)

1. **Tag the image:**
   ```bash
   docker tag real-estate-backend:latest your-dockerhub-username/real-estate-backend:latest
   ```

2. **Login to Docker Hub:**
   ```bash
   docker login
   ```

3. **Push the image:**
   ```bash
   docker push your-dockerhub-username/real-estate-backend:latest
   ```

## Troubleshooting

### Container fails to start
- Check logs: `docker logs real-estate-backend`
- Verify environment variables are set correctly
- Ensure MongoDB is accessible from the container

### Port already in use
- Change the port mapping: `-p 5001:5000` (maps host port 5001 to container port 5000)

### Cannot connect to MongoDB
- If using localhost, use `host.docker.internal` instead
- For Docker Compose, create a MongoDB service in the compose file

## MongoDB with Docker Compose

To include MongoDB in your Docker setup, update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/property_broker
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./excel-data:/app/excel-data
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
```

## Production Considerations

1. **Use multi-stage builds** for smaller image size
2. **Set proper resource limits** for containers
3. **Use secrets management** for sensitive data
4. **Enable health checks** in your Dockerfile
5. **Use a reverse proxy** (nginx) in front of your app
6. **Regular security updates** for base images

## Quick Commands

```bash
# Build
docker build -t real-estate-backend:latest .

# Run
docker run -d -p 5000:5000 --name real-estate-backend real-estate-backend:latest

# Logs
docker logs -f real-estate-backend

# Stop
docker stop real-estate-backend

# Clean up everything
docker-compose down -v --rmi all
```
