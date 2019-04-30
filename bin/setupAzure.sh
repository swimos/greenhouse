#!/usr/bin/env bash
# Original instructions for setting up IoT edge on a pi can be found here:
# https://www.hackster.io/ngkurt/azure-iot-edge-with-sense-hat-and-raspberry-pi-06791b

#colors
GREEN='\033[0;32m'
LTGREEN='\033[1;32m'
GREY='\033[1;30m'
NC='\033[0m' # No Color

printf "${LTGREEN} Setup Azure Iot runtime"

printf "*${GREY} do system update${NC}\n"
(sudo apt-get -y update)

printf "*${GREY} Download and install moby engine${NC}\n"
(curl -L https://aka.ms/moby-engine-armhf-latest -o moby_engine.deb && sudo dpkg -i ./moby_engine.deb)

printf "*${GREY} Download and install moby command line${NC}\n"
(curl -L https://aka.ms/moby-cli-armhf-latest -o moby_cli.deb && sudo dpkg -i ./moby_cli.deb)

printf "*${GREY} Fix the installation${NC}\n"
(sudo apt-get install -f -y)

printf "*${GREY} Install security manager implementation for IOT Edge${NC}\n"
(curl -L https://aka.ms/libiothsm-std-linux-armhf-latest -o libiothsm-std.deb && sudo dpkg -i ./libiothsm-std.deb)

printf "*${GREY} Download and install the IOT Edge Security Daemon${NC}\n"
curl -L https://aka.ms/iotedged-linux-armhf-latest -o iotedge.deb && sudo dpkg -i ./iotedge.deb

printf "*${GREY} Fix the installation again${NC}\n"
(sudo apt-get install -f)

printf "${LTGREEN} Complete."