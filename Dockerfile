FROM node:6-onbuild
RUN mkdir -p /usr/src/app/back
WORKDIR /usr/src/app/back
COPY package.json /usr/src/app/back/
RUN npm install
COPY . /usr/src/app/back
EXPOSE 5000
CMD [ "node", "app.js" ]