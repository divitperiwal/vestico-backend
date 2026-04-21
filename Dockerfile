FROM node:22-alpine as builder

WORKDIR /build

COPY package*.json .

RUN npm install

COPY src/ src/
COPY tsconfig.json tsconfig.json

RUN npm run build
RUN npm prune --omit=dev


#Step 2
FROM node:22-alpine

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules/
COPY --from=builder build/dist dist/

CMD ["node", "dist/server.js"]

