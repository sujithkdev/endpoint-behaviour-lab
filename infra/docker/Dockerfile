FROM node:24-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENTRYPOINT ["node"]
CMD ["apps/ingest/src/main.mjs"]

FROM base AS test
RUN npm ci
ENTRYPOINT ["npm"]
CMD ["test"]
