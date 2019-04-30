#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
printf "${GREY}Start Node & SWIM${NC}\n"


botNumber=${1}
usr=${2}
pwd=${3}
botName="raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}

printf "${GREY}remote start ${GREEN}${sshAddress}${NC}\n"

(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm ./${INSTALL_FOLDER}/*.log
rm ./${INSTALL_FOLDER}/*.err
'")

(export SSHPASS=${pwd}
sshpass -e ssh ${sshAddress} "sh -c 'cd ${INSTALL_FOLDER}/java; ./dist/java-1.0.1/bin/java -Pconfig=${botName} > ~/${INSTALL_FOLDER}/swim.log 2> ~/${INSTALL_FOLDER}/swim.err < /dev/null &'"
sshpass -e ssh ${sshAddress} "sh -c 'cd ${INSTALL_FOLDER}/javascript; nohup npm start config=${botName} > ~/${INSTALL_FOLDER}/node.log 2> ~/${INSTALL_FOLDER}/node.err < /dev/null &'"
sshpass -e ssh ${sshAddress} "sh -c 'DISPLAY=:0 chromium-browser --kiosk ${startPages[${botNumber}]} > ~/${INSTALL_FOLDER}/other.log 2> ~/${INSTALL_FOLDER}/other.err < /dev/null &'")



printf "${GREEN}Done.${NC}\n"
