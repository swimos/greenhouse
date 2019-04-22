#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Start Node${NC}\n"

(cd $path;
    cd javascript/
    nohup npm start "$@" &)

printf "${GREEN}Done.${NC}\n"