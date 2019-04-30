#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Start SWIM${NC}\n"

(cd $path;
    cd java/
    rm nohup.out
    nohup sh -c "./dist/java-1.0.1/bin/java 2>&1 | ts" -P"$@" &)

printf "${GREEN}Done.${NC}\n"    
