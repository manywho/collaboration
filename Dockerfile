FROM mhart/alpine-node-base

EXPOSE 3000
CMD ["node", "server.js"]

WORKDIR /src
ADD . .