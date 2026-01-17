# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the server zip file
COPY server.zip /app/

# Install unzip utility
RUN apk add --no-cache unzip

# Extract the zip file
RUN unzip server.zip && \
    rm server.zip && \
    cp -r server/. . && \
    rm -rf server

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

# Create necessary directories
RUN mkdir -p uploads excel-data

# Expose the port the app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
