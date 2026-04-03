FROM python:3.11-slim

WORKDIR /app

# System deps + Node.js for Prisma generate
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY apps/api/pyproject.toml .
COPY apps/api/app/ ./app/
# TODO: Add --no-cache-dir for production builds
RUN pip install -e .

# Copy shared Prisma schema, swap JS generator → Python generator, then generate
COPY packages/db/prisma/ ./prisma/
RUN sed -i 's/provider = "prisma-client-js"/provider = "prisma-client-py"/' ./prisma/schema.prisma \
    && python -m prisma generate --schema=./prisma/schema.prisma

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
