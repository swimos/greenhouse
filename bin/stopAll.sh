#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Stop Node and Swim${NC}\n"

killall chromium-browser

${path}/bin/stopNode.sh

${path}/bin/stopSwim.sh

printf "${GREEN}Done.${NC}\n"