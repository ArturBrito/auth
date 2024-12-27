# Base stage
FROM node:18 AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Build stage
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18 AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/build ./build
COPY package*.json ./
COPY rs256.rsa* ./
RUN npm install --omit=dev
CMD [ "npm", "run", "start:prod" ]

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "start"]