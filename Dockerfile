FROM quay.io/skygeario/skygear-node:v1.1.2
# Install the dependencies of our app
COPY package.json /usr/src/app/
RUN npm install
COPY index.js /usr/src/app/index.js
COPY src /usr/src/app/src
CMD ["skygear-node", "index.js"]
