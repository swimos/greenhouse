#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY}Build All${NC}\n"

${path}/bin/buildNode.sh "$@"

${path}/bin/buildSwim.sh "$@"
