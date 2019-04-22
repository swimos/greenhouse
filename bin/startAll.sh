#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Start Node & SWIM${NC}\n"

${path}/bin/startSwim.sh "$@"

${path}/bin/startNode.sh "$@"

#echo 'launch chrome in kiosk mode'
# DISPLAY=:0 chromium-browser --kiosk http://127.0.0.1:8080/plantMon &
printf "${GREEN}Done.${NC}\n"
