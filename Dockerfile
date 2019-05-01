
FROM ubuntu:18.04
WORKDIR /
RUN /bin/bash -c 'apt-get update -y'
RUN /bin/bash -c 'apt-get install -y software-properties-common moreutils curl wget unzip'
RUN /bin/bash -c 'apt-get install apt-utils -y'
RUN /bin/bash -c 'apt-get install apt-transport-https ca-certificates -y'
RUN /bin/bash -c 'add-apt-repository ppa:openjdk-r/ppa'
RUN /bin/bash -c 'apt update -y'
RUN /bin/bash -c 'apt install -y openjdk-11-jdk'

FROM node:11-stretch
WORKDIR /
RUN /bin/bash -c 'npm install -g node-gyp --unsafe-perm'
RUN /bin/bash -c 'npm install -g serialport --unsafe-perm'

EXPOSE 8080
#EXPOSE 9001
#EXPOSE 22
EXPOSE 5620
#EXPOSE 443

COPY /bin/* /greenhouse/bin/
COPY /config/java/* /greenhouse/config/java/
COPY /config/node/* /greenhouse/config/node/
COPY /hardware/* /greenhouse/hardware/
COPY /java/* /greenhouse/java/
COPY /java/gradle/wrapper/* /greenhouse/java/gradle/wrapper/
COPY /java/src/main/java/* /greenhouse/java/src/main/java/
COPY /java/src/main/java/ai/swim/* /greenhouse/java/src/main/java/ai/swim/
COPY /java/src/main/java/ai/swim/util/* /greenhouse/java/src/main/java/ai/swim/util/
COPY /java/src/main/java/ai/swim/service/* /greenhouse/java/src/main/java/ai/swim/service/
COPY /java/src/main/resources/* /greenhouse/java/src/main/resources/
COPY /javascript/* /greenhouse/javascript/
COPY /javascript/bots/* /greenhouse/javascript/bots/
COPY /javascript/modules/* /greenhouse/javascript/modules/
COPY /javascript/services/* /greenhouse/javascript/services/
COPY /javascript/httpServer/* /greenhouse/javascript/httpServer/
COPY /javascript/httpServer/views/* /greenhouse/javascript/httpServer/views/

WORKDIR /greenhouse/javascript/

RUN /bin/bash -c 'npm install'

ENTRYPOINT ["npm","start"]