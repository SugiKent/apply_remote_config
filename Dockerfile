FROM node:17

WORKDIR /scripts
COPY ./package.json ./package-lock.json ./entrypoint.sh /scripts/

RUN npm install

COPY . .

ENTRYPOINT [ "/scripts/entrypoint.sh" ]
