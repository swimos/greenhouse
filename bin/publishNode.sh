#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

botNumber=${1}
usr=${2}
pwd=${3}
botName="Raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}
full_file_name="${FILENAME}-node-${VERSION}.tar.gz"

printf "*${GREY}Publish node to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} upload node tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}/javascript
mkdir -p ${INSTALL_FOLDER}/javascript
tar -C ${INSTALL_FOLDER}/javascript -xzf ${full_file_name}
'")

printf "*${GREY} run npm install to build/refresh node packages${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
cd ${INSTALL_FOLDER}/javascript
npm install
'")

printf "${GREEN}Done.${NC}\n"