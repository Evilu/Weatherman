# Build stage: generate SQL migration from Prisma schema using Node (npx prisma)
FROM node:18-alpine AS builder
WORKDIR /workspace

# Copy the Prisma schema from the backend service into the builder
COPY ./application/prisma/schema.prisma ./schema.prisma

# Create output dir and generate SQL migration from empty DB to the Prisma datamodel
RUN mkdir -p ./pgdata \
  && npx prisma migrate diff --from-empty --to-schema-datamodel ./schema.prisma --script > ./pgdata/01_init.sql

# Final image: Postgres with generated init scripts
FROM postgres:16.1

# Copy generated init SQL from the builder and the repo-provided functions file
COPY --from=builder /workspace/pgdata/01_init.sql /docker-entrypoint-initdb.d/01_init.sql
COPY ./databases/deployments/weatherman/pgdata/02_functions.sql /docker-entrypoint-initdb.d/02_functions.sql

# Ensure scripts are executable
RUN chmod -R 755 /docker-entrypoint-initdb.d

# Expose Postgres port
EXPOSE 5432

# Default command (can be overridden by compose)
CMD ["postgres", "-c", "log_statement=all"]
