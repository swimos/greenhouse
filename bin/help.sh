#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "
${RED}Simple App Manager Help${NC}

~~~${GREEN} Usage ${NC}~~~

./bin/appManager.sh [command] [\"list of raspi IDs\"] [remotePassword]

[command] ${GREY}- required. See below for the full list of commands${NC}
[\"list of raspi IDs\"] ${GREY}- (remote only) list of pis to be managed. Does lookup into iplist in global.sh${NC}
[remotePassword] ${GREY}- (remote only) ssh password for the device(s)${NC}

~~~${GREEN} Commands ${NC}~~~

${LTGREEN}Local App Management Commands${NC}
    start       ${GREY} - start up both node and swim${NC}
    startNode   ${GREY} - start up just node${NC}
    startSwim   ${GREY} - start up just swim${NC}

    stop        ${GREY} - stop node, swim, and chromium${NC}
    stopNode    ${GREY} - stop just node${NC}
    stopSwim    ${GREY} - stop just swim${NC}

    build       ${GREY} - build both node (npm) and swim (gradle)${NC}
    buildNode   ${GREY} - build node with npm${NC}
    buildSwim   ${GREY} - build swim with gradle and untar to dist${NC}

    package     ${GREY} - creates a gzip package file to the /dist directory of both node and swim codebase which is then used for remote deployment${NC}
    packageNode ${GREY} - creates a package of just the node side of the app${NC}
    packageSwim ${GREY} - creates a package of just the SWIM side of the app${NC}

${LTGREEN}Remote App Management Commands${NC}
    testssh     ${GREY} - used to verify that you are able to use sshpass to ssh into the remote device${NC}

    ${GREY}(all publish commands remove and recreate the remote target directory on each publish to ensure a clean build)${NC}
    publish     ${GREY} - Pushes the package file to each device and unpacks it into the runtime folder${NC}
    publishNode ${GREY} - Pushes just the node the package file to each device and unpacks it into the runtime folder${NC}
    publishSwim ${GREY} - Pushes just the swim the package file to each device and unpacks it into the runtime folder${NC}

    ${GREY}(update commands do not clean or remove any existing folders or code on the remote device)${NC}
    all          ${GREY} - Does a full package, publish and build to each device. Removes target install and build folders before publish and restarts the device once coplete${NC}
    startRemote  ${GREY} - Stops and restarts target device. Cleans out temp files and swim db before start up.${NC}
    stopRemote   ${GREY} - Stops target device.${NC}
    updateRemote ${GREY} - Pushes the full package file to each remote device, unpacks over the existing runtime, builds swim again and restarts the device${NC}


~~~${GREEN} Examples ${NC}~~~

${GREY}* Build, package, deploy the app to raspi3, 4, 5 , and 10 followed by restarting each device${NC}
./bin/appManager.sh all \"3 10 4 5 6\" MyPassWord 

${GREY}* Like the 'all' command but does not remove existing files or build node again. Faster then running all.${NC}
./bin/appManager.sh updateRemote \"3 10 4 5 6\" MyPassWord 

${GREY}* Stop and restart raspi3, 4, 5 , and 10${NC}
./bin/appManager.sh startRemote \"3 10 4 5 6\" MyPassWord 

${GREY}* Start up the full app locally${NC}
./bin/appManager.sh start

${GREY}* Build the full app locally${NC}
./bin/appManager.sh build

${GREY}* Build just the swim side of the app locally${NC}
./bin/appManager.sh buildSwim


"