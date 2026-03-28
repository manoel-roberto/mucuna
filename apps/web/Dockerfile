FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install

COPY . .
RUN cd apps/web && npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
