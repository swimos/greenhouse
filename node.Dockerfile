FROM node:11-stretch
# FROM resin/raspberrypi3-debian:stretch

WORKDIR /
RUN /bin/bash -c 'curl -sL https://deb.nodesource.com/setup_12.x | bash -'
RUN /bin/bash -c 'apt-get install nodejs -y'
# RUN /bin/bash -c 'apt-get update -y'
# RUN /bin/bash -c 'npm install -g node-gyp --unsafe-perm'
# RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'

COPY /bin/. /greenhouse/bin/.
COPY /config/node/. /greenhouse/config/node/.
COPY /javascript/. /greenhouse/javascript/.
COPY /javascript/bots/. /greenhouse/javascript/bots/.
COPY /javascript/modules/. /greenhouse/javascript/modules/.
COPY /javascript/services/. /greenhouse/javascript/services/.
COPY /javascript/httpServer/. /greenhouse/javascript/httpServer/.
COPY /javascript/httpServer/views/. /greenhouse/javascript/httpServer/views/.
COPY /javascript/httpServer/views/layouts/. /greenhouse/javascript/httpServer/views/layouts/.

WORKDIR /greenhouse/javascript/

RUN /bin/bash -c 'npm install'

ENTRYPOINT ["npm","start"]

EXPOSE 8080
EXPOSE 8001
EXPOSE 9001
EXPOSE 22
EXPOSE 5620
EXPOSE 443
