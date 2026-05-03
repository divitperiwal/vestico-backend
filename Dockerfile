FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --production

COPY src ./src
COPY tsconfig.json ./
COPY migrations ./migrations
COPY drizzle.config.ts ./

CMD ["bun", "src/server.ts"]