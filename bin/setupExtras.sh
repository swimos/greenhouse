#!/usr/bin/env bash

#colors
GREEN='\033[0;32m'
LTGREEN='\033[1;32m'
GREY='\033[1;30m'
NC='\033[0m' # No Color

printf "${LTGREEN}Do PI Setup${NC}\n"

printf "*${GREY} do system update${NC}\n"
(sudo apt-get -y update)

printf "*${GREY} do system upgrade${NC}\n"
(sudo apt-get -y upgrade)

printf "*${GREY} install software-properties-common${NC}\n"
(sudo apt-get install -y software-properties-common)
(sudo apt-get install -y moreutils)

printf "*${GREY} add package repos${NC}\n"
(sudo add-apt-repository -y ppa:openjdk-r/ppa
sudo add-apt-repository -y ppa:cwchien/gradle)

printf "*${GREY} do system update (again)${NC}\n"
(sudo apt-get -y update)

printf "*${GREY} install node 9.11/x${NC}\n"
(curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g node-gyp --unsafe-perm
sudo npm install -g serialport --unsafe-perm)

printf "*${GREY} install xrdp${NC}\n"
(sudo apt-get purge -y realvnc-vnc-server
sudo apt-get install -y xrdp)

printf "*${GREY} install java${NC}\n"
(sudo apt-get remove -y openjdk-9-jdk-headless
sudo apt-get remove -y openjdk-9-jre-headless
sudo apt-get remove -y openjdk-9-jdk
sudo apt-get remove -y openjdk-9-jre
sudo apt-get install -y openjdk-9-jdk-headless
sudo apt-get install -y openjdk-9-jdk)

printf "*${GREY} install sshpass${NC}\n"
(sudo apt-get install -y sshpass)

printf "${GREEN}Done.${NC}\n"