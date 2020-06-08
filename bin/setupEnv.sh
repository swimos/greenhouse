#!/usr/bin/env bash

#colors
GREEN='\033[0;32m'
LTGREEN='\033[1;32m'
GREY='\033[1;30m'
NC='\033[0m' # No Color

printf "${LTGREEN}Do PI Setup${NC}\n"

printf "*${GREY} do system update${NC}\n"
(sudo apt-get -y update)

# printf "*${GREY} do system upgrade${NC}\n"
# (sudo apt-get -y upgrade)

printf "*${GREY} install software-properties-common${NC}\n"
(sudo apt-get install -y software-properties-common)
(sudo apt-get install -y moreutils)

printf "*${GREY} add package repos${NC}\n"
(sudo add-apt-repository -y ppa:openjdk-r/ppa)

printf "*${GREY} do system update (again)${NC}\n"
(sudo apt-get -y update)

printf "*${GREY} install node 11/x${NC}\n"
(sudo apt-get remove -y nodejs
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g node-gyp --unsafe-perm
sudo npm install -g serialport --unsafe-perm)

printf "*${GREY} install java${NC}\n"
(sudo apt-get remove -y openjdk-8-jdk-headless
sudo apt-get remove -y openjdk-8-jre-headless
sudo apt-get remove -y openjdk-8-jdk
sudo apt-get remove -y openjdk-8-jre
sudo apt-get remove -y openjdk-9-jdk-headless
sudo apt-get remove -y openjdk-9-jre-headless
sudo apt-get remove -y openjdk-9-jdk
sudo apt-get remove -y openjdk-9-jre
sudo apt-get install -y openjdk-9-jdk-headless
sudo apt-get install -y openjdk-9-jdk)

printf "${GREEN}Done.${NC}\n"