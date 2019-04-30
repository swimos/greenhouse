#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Stop Remote Node & SWIM${NC}\n"


botNumber=${1}
usr=${2}
pwd=${3}
botName="raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}

printf "${GREY}remote stop ${GREEN}${sshAddress}${NC}\n"

(export SSHPASS=${pwd}
sshpass -e ssh ${sshAddress} "sh -c '
killall chromium-browser
killall java
killall node
killall python3
'")

printf "${GREEN}Done.${NC}\n"
