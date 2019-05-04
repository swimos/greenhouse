FROM node:11-stretch
# FROM resin/raspberrypi3-debian:stretch

ENV CONFIG=localhost

WORKDIR /
RUN /bin/bash -c 'curl -sL https://deb.nodesource.com/setup_12.x | bash -'
RUN /bin/bash -c 'apt-get install nodejs -y'
# RUN /bin/bash -c 'apt-get update -y'
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends build-essential libboost-python1.62.0 python3-pip libpython3-dev && \
    apt-get install -y libxml2 libxml2-dev bison flex libcdk5-dev libavahi-client-dev cmake git

RUN pip3 install --upgrade pip 
RUN pip3 install --upgrade setuptools 
RUN pip3 install sense-hat
RUN /bin/bash -c 'npm install -g node-gyp --unsafe-perm'
RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'

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

RUN echo "Start ${CONFIG}"

ENTRYPOINT ["npm","start", "config=${CONFIG}"]

EXPOSE 8080
