FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --production

COPY src ./src
COPY tsconfig.json ./

CMD ["bun", "src/server.ts"]