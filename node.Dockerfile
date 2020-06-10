FROM node:12-stretch
# FROM resin/raspberrypi3-debian:stretch

ENV CONFIG=localhost

RUN apt-get update && apt-get install -y curl python-numpy python-pil apt-utils 
WORKDIR /tmp

# RUN curl -LO  https://archive.raspberrypi.org/debian/pool/main/r/rtimulib/librtimulib-dev_7.2.1-3_armhf.deb \
#  && curl -LO https://archive.raspberrypi.org/debian/pool/main/r/rtimulib//librtimulib-utils_7.2.1-3_armhf.deb \
#  && curl -LO https://archive.raspberrypi.org/debian/pool/main/r/rtimulib/librtimulib7_7.2.1-3_armhf.deb \
#  && curl -LO https://archive.raspberrypi.org/debian/pool/main/r/rtimulib/python-rtimulib_7.2.1-3_armhf.deb \
#  && curl -LO https://archive.raspberrypi.org/debian/pool/main/p/python-sense-hat/python-sense-hat_2.1.0-1_armhf.deb
 
 
# RUN dpkg -i librtimulib-dev_7.2.1-3_amd64.deb librtimulib-utils_7.2.1-3_amd64.deb librtimulib7_7.2.1-3_amd64.deb python-rtimulib_7.2.1-3_amd64.deb python-sense-hat_2.1.0-1_amd64.deb

RUN rm -f /tmp/*.deb
RUN apt-get clean

WORKDIR /

RUN /bin/bash -c 'apt-get update -y'
RUN apt-get update -y && \
    apt-get install -y build-essential python3 python3-pip libpython3-dev apt-utils libxml2 libxml2-dev bison flex libcdk5-dev libavahi-client-dev cmake git python-dev gcc build-essential libboost-python-dev libpython3-dev
# RUN apt-get install -y libxml2 libxml2-dev bison flex libcdk5-dev libavahi-client-dev cmake git

RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN pip3 install websocket-client
RUN pip3 install sense-hat

# RUN git clone https://github.com/RPi-Distro/RTIMULib/

# WORKDIR /RTIMU/Linux/python/

RUN git clone https://github.com/RPi-Distro/RTIMULib/ && \
    cd RTIMULib/Linux/python/ && \
    python3 setup.py build && \
    python3 setup.py install

WORKDIR /

COPY /bin/. /greenhouse/bin/.
COPY /config/node/. /greenhouse/config/node/.
COPY /hardware/. /greenhouse/hardware/.
COPY /javascript/. /greenhouse/javascript/.
COPY /javascript/bots/. /greenhouse/javascript/bots/.
COPY /javascript/modules/. /greenhouse/javascript/modules/.
COPY /javascript/services/. /greenhouse/javascript/services/.
COPY /javascript/httpServer/. /greenhouse/javascript/httpServer/.
COPY /javascript/httpServer/views/. /greenhouse/javascript/httpServer/views/.
COPY /javascript/httpServer/views/layouts/. /greenhouse/javascript/httpServer/views/layouts/

WORKDIR /greenhouse/javascript/

RUN /bin/bash -c 'npm install'
RUN /bin/bash -c 'npm install -g node-gyp --unsafe-perm'
RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'

RUN echo "Start ${CONFIG}"

ENTRYPOINT ["npm","start", "config=${CONFIG}"]

EXPOSE 8080
EXPOSE 5620
