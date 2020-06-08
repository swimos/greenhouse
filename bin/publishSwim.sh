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
full_file_name="${FILENAME}-java-${VERSION}.tar.gz"

printf "#${GREY} Publish SWIM to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} upload java tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}/java
mkdir -p ${INSTALL_FOLDER}/java
tar -C ${INSTALL_FOLDER}/java -xzf ${full_file_name}
'")

printf "*${GREY} run gradle build${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
cd ${INSTALL_FOLDER}/java
./gradlew build -Pconfig=${botName}
rm -rf dist/
mkdir dist/
tar -xf build/distributions/java-1.0.1.tar -C dist/
'")

printf "${GREEN}Done.${NC}\n"
