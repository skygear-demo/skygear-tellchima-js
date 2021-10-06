# skygear uses crypto.createHas('sha'), which was deprecated and only availabe on Node 8.
FROM node:8-buster
WORKDIR /usr/src/app
# Install the dependencies of our app
COPY package.json /usr/src/app/
RUN npm install
COPY index.js /usr/src/app/index.js
COPY src /usr/src/app/src
ENV NODE_OPTIONS=--use-openssl-ca
CMD ["./node_modules/.bin/skygear-node", "index.js"]
