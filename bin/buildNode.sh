#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY} do npm install${NC}\n"
(cd javascript
npm install)
