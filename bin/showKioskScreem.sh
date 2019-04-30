#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

DISPLAY=:0 chromium-browser --kiosk http://127.0.0.1:8080/plantMon &
printf "${GREEN}Done.${NC}\n"

