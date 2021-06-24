FROM node:14.16.0
WORKDIR /app
COPY . /app/
COPY .env /app/
COPY package*.json /app/
RUN npm install
RUN npm run build
#  CMD ["node", "src/index.js"]

CMD [ "npm", "run", "start:dev" ]
