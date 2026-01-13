# Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies (including dev for building)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
