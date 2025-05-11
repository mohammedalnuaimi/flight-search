# Use Node.js LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=development

# Command to run the application
CMD ["npm", "start"] 