FROM node:12-buster
WORKDIR /usr/src/app
# Install the dependencies of our app
COPY package.json /usr/src/app/
RUN npm install
COPY index.js /usr/src/app/index.js
COPY src /usr/src/app/src
CMD ["./node_modules/.bin/skygear-node", "index.js"]
