FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy backend dependency files (adjusting path since Dockerfile is at root)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY backend/ .

# Build the NestJS application
RUN npm run build

# Expose port 7860 (Required for Hugging Face Spaces)
EXPOSE 7860

# Start the application
CMD ["npm", "run", "start:prod"]
