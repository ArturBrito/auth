# Base stage
FROM node:18 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production=false

# Build stage
FROM base AS build
COPY . .
RUN npm run build

# Production stage
FROM node:18 AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/build ./build
COPY package*.json ./
COPY rs256.rsa .
COPY rs256.rsa.pub .
RUN npm install --omit=dev
CMD [ "npm", "run", "start:prod" ]

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "start"]