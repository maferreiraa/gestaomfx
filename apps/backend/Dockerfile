FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend files
COPY apps/backend ./apps/backend

# Install dependencies
RUN npm ci --omit=dev

# Generate Prisma
RUN cd apps/backend && npx prisma generate

# Build TypeScript
RUN cd apps/backend && npm run build

# Expose port
EXPOSE 3002

# Start command
CMD ["node", "apps/backend/dist/main.js"]
