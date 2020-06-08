#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY}Build Swim${NC}\n"

(cd $path;
    cd java/
    echo 'gradle build'
	./gradlew build -P"$@"

    echo 'remove old /dist'
    rm -rf dist/
    echo 'make new /dist'
    mkdir dist/
    echo 'tar new build to /dist'
	tar -xf build/distributions/java-1.0.1.tar -C dist/)

printf "${GREEN}Done.${NC}\n"
