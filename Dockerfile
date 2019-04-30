
FROM ubuntu:18.04
WORKDIR /
RUN /bin/bash -c 'apt-get update -y'
RUN /bin/bash -c 'apt-get install -y software-properties-common moreutils curl'
RUN /bin/bash -c 'add-apt-repository -y ppa:openjdk-r/ppa'
RUN /bin/bash -c 'apt-get update -y'
# RUN /bin/bash -c 'apt-get install -y openjdk-9-jdk-headless openjdk-9-jdk'

FROM node:11-stretch
WORKDIR /
#RUN /bin/bash -c 'curl -sL https://deb.nodesource.com/setup_11.x'
# RUN /bin/bash -c 'apt-get install -y nodejs'
RUN /bin/bash -c 'npm install -g node-gyp --unsafe-perm'
RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'

EXPOSE 8080
#EXPOSE 9001
#EXPOSE 22
EXPOSE 5620
#EXPOSE 443
