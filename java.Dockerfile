FROM openjdk:11-jdk-stretch

ENV CONFIG=$CONFIG

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

RUN echo "Build For $CONFIG"

RUN /bin/bash -c './gradlew build -Pconfig=$CONFIG'
RUN /bin/bash -c 'mkdir -p dist'
RUN /bin/bash -c 'tar -xf build/distributions/java-1.0.1.tar -C dist/'

ENTRYPOINT ["./dist/java-1.0.1/bin/java", "-Pconfig=$CONFIG"]

EXPOSE 5620
