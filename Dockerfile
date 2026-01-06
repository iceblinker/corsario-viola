FROM node:18-alpine

WORKDIR /app

# Install dependencies (only copy package files first for better caching)
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
