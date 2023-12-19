FROM node:18-alpine3.19 as base
RUN apk add --update openssl bash tini
ENTRYPOINT [ "/sbin/tini", "--" ]

FROM base as dev

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base as prod

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json prisma/schema.prisma ./
RUN npm ci --omit=dev
COPY --from=dev /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
