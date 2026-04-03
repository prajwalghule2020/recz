FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root workspace files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy the shared DB package
COPY packages/db/ ./packages/db/

# Copy the web app
COPY apps/web/ ./apps/web/

# Install all workspace deps
RUN pnpm install --no-frozen-lockfile --filter web... --filter @repo/db

# Generate Prisma client
RUN cd packages/db && npx prisma generate

WORKDIR /app/apps/web

ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["pnpm", "dev"]
