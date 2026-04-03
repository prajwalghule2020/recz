# Database Package (`@repo/db`)

This package centralizes the database schema and Data Access layer for the Face-AI application. By keeping it as a shared package, all parts of the turborepo stack (API, web, worker, etc.) have unified and strictly typed access to the PostgreSQL database.

## Overview
It uses the Prisma ORM as the primary means to map relational tables into TypeScript interfaces.
The configuration and models are defined centrally inside `prisma/schema.prisma`. 

During execution:
- Prisma generates a fully-typed `PrismaClient`.
- Next.js Applications (`web`) or node backends can simply import and instantiate the client to interact with PostgreSQL seamlessly without rewriting database boilerplate.

## Schema Highlights
- Keeps track of Jobs, status, errors and timestamps.
- Records standard `Image` metadata logic.
- Links `Face` records against jobs.

## Scripts & CLI
If database modifications are required, you must use Prisma's standard CLI workflow from this directory:
```bash
# Push schema updates directly to the connected DB (Dev workflow)
npx prisma db push

# Generate client after schema modifications
npx prisma generate
```
