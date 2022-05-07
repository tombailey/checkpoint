FROM node:16-alpine as builder

WORKDIR /app/build

COPY package*.json ./
RUN npm install
COPY tsconfig.json .
COPY src /app/build/src
RUN npm run build



FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY --from=builder /app/build/dist /app/dist

CMD [ "npm", "run", "start" ]
