FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev", "--host"]
