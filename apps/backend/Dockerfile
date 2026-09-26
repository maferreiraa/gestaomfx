FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend files
COPY apps/backend ./apps/backend

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install

# Build TypeScript
RUN cd apps/backend && npm run build

# Remove devDependencies for production
RUN npm prune --omit=dev

# Expose port
EXPOSE 3002

# Start command
CMD ["node", "apps/backend/dist/main.js"]
