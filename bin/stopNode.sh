#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Stop Node${NC}\n"

(cd $path;
    killall node
    killall python3)

printf "${GREEN}Done.${NC}\n"    