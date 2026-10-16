FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]