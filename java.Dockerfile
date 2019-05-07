FROM openjdk:11-jdk-stretch

WORKDIR /

COPY /config/java/. /greenhouse/config/java/.
COPY /java/. /greenhouse/java/.
COPY /java/gradle/wrapper/. /greenhouse/java/gradle/wrapper/.
COPY /java/src/main/java/. /greenhouse/java/src/main/java/.
COPY /java/src/main/java/ai/swim/. /greenhouse/java/src/main/java/ai/swim/.
COPY /java/src/main/java/ai/swim/util/. /greenhouse/java/src/main/java/ai/swim/util/.
COPY /java/src/main/java/ai/swim/service/. /greenhouse/java/src/main/java/ai/swim/service/.
COPY /java/src/main/resources/. /greenhouse/java/src/main/resources/.

WORKDIR /greenhouse/java/

RUN /bin/bash -c './gradlew build'
RUN /bin/bash -c 'mkdir dist'
RUN /bin/bash -c 'tar -xf build/distributions/java-1.0.tar -C dist/'

ENTRYPOINT ["./dist/java-1.0/bin/java"]

EXPOSE 5620
