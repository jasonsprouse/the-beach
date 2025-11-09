# Stage 1: Install dependencies
FROM node:18 AS dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Stage 2: Build the application
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN npx nest build

# Stage 3: Production image
FROM node:18-slim
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
