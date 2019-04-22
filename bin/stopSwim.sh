#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Stop SWIM${NC}\n"

(cd $path;
    killall java)

printf "${GREEN}Done.${NC}\n"    