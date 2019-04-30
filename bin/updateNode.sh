#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

botNumber=${1}
usr=${2}
pwd=${3}
botName="raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}

javascript_src_dir=${path}/javascript
java_src_dir=${path}/java
bin_dir=${path}/bin
config_dir=${path}/config

full_file_name="${FILENAME}-node-${VERSION}.tar.gz"

printf "*${GREY} Publish App to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} clean up temp files and stop runnig processes${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
killall chromium-browser
killall node
rm node.log
rm node.err
rm ${full_file_name}
'")

printf "*${GREY} upload app tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'

rm -rf ${INSTALL_FOLDER}/javascript/bots
rm -rf ${INSTALL_FOLDER}/javascript/httpServer
rm -rf ${INSTALL_FOLDER}/javascript/modules
rm -rf ${INSTALL_FOLDER}/javascript/services
rm -rf ${INSTALL_FOLDER}/hardware

tar -C ${INSTALL_FOLDER} -xzf ${full_file_name}
'")

printf "${GREEN}Done.${NC}\n"
