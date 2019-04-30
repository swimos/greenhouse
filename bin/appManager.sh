#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

# create local vars
usr=${user:-pi}
action=${1}
botList=(${2:-0})
pwd=${3}

setup_env () {
    botNumber=${1}
    botName="raspi${botNumber}"
    botIp=${ipList[${botNumber}]}
    sshAddress=${usr}@${botIp}

    printf "${GREY}Do install on ${LTGREEN}${botName}${NC}@${GREEN}${botIp}${NC}:${GREY}${pwd}${NC}\n"
    
    printf "*${GREY} upload setup scripts to device${NC}\n"
    (export SSHPASS=${pwd}
    sshpass -e scp ${path}/bin/setupEnv.sh ${sshAddress}:)

    printf "*${GREY} execute setup script on device${NC}\n"
    (export SSHPASS=${pwd}
    sshpass -e ssh -qtt ${sshAddress} bash -c "'
    ./setupEnv.sh
    '")  
}

setup_extras () {
    botNumber=${1}
    botName="raspi${botNumber}"
    botIp=${ipList[${botNumber}]}
    sshAddress=${usr}@${botIp}

    printf "${GREY}Do install on ${LTGREEN}${botName}${NC}@${GREEN}${botIp}${NC}:${GREY}${pwd}${NC}\n"
    
    printf "*${GREY} upload setup scripts to device${NC}\n"
    (export SSHPASS=${pwd}
    sshpass -e scp ${path}/bin/setupExtras.sh ${sshAddress}:)

    printf "*${GREY} execute setup script on device${NC}\n"
    (export SSHPASS=${pwd}
    sshpass -e ssh -qtt ${sshAddress} bash -c "'
    ./setupExtras.sh
    '")  
}

snorlax () {
    ${path}/bin/snorlax.sh
}

build_node () {
    ${path}/bin/buildNode.sh
}

build_swim () {
    ${path}/bin/buildSwim.sh config=raspi${1}
}

start_node () {
    ${path}/bin/startNode.sh
}

start_swim () {
    ${path}/bin/startSwim.sh config=raspi${1}
}

stop_node () {
    ${path}/bin/stopNode.sh
}

stop_swim () {
    ${path}/bin/stopSwim.sh config=raspi${1}
}

package_node () {
    ${path}/bin/packageNode.sh
}

package_swim () {
    ${path}/bin/packageSwim.sh
}

package_all () {
    ${path}/bin/packageAll.sh
}

publish_node () {
    ${path}/bin/publishNode.sh ${@}
}

publish_swim () {
    ${path}/bin/publishSwim.sh ${@}
}

publish_all () {
    ${path}/bin/publishAll.sh ${@}
}

update_all () {
    ${path}/bin/updateAll.sh ${@}
}

update_node () {
    ${path}/bin/updateNode.sh ${@}
}

test_ssh () {
    botNumber=${1}
    botName="raspi${botNumber}"
    botIp=${ipList[${botNumber}]}
    sshAddress=${usr}@${botIp}

    printf "${GREY}test ssh to ${GREEN}${sshAddress}${NC}\n"

    (export SSHPASS=${pwd}
    sshpass -e ssh -qtt ${sshAddress} bash -c "'
    pwd
    ls
    '")

    (export SSHPASS=${pwd}
    sshpass -e scp ${path}/dist/swim-greenhouse-java-1.0.1.tar.gz ${sshAddress}:)

}


start_remote () {
    ${path}/bin/startRemote.sh ${@}
}

stop_remote () {
     ${path}/bin/stopRemote.sh ${@}
}

help () {
     ${path}/bin/help.sh ${@}
}

# Main
printf "\n########## ${LTGREEN}start ${action}${NC} ##########\n"
case $action in

    # ###############################
    # commands for local app managements
    
    # local start commands
    start)
        start_node     
        start_swim   
        ;;
    startNode)
        start_node     
        ;;
    startSwim)
        start_swim   
        ;;

    # local stop commands
    stop)
        stop_node     
        stop_swim   
        ;;
    stopNode)
        stop_node     
        ;;
    stopSwim)
        stop_swim   
        ;;

    # local build commands
    build)
        build_node     
        build_swim   
        ;;
    buildNode)
        build_node     
        ;;
    buildSwim)
        build_swim   
        ;;

    # package for publish commands
    package)
        package_all
        ;;
    packageNode)
        package_node
        ;;
    packageSwim)
        package_swim
        ;;

    # ###############################
    # commands for remote app/device management

    # test ssh connection to remote devices
    testssh)
        for botIndex in ${botList[@]}; do
            test_ssh ${botIndex} ${usr} ${pwd}
        done
        ;;
    # install and setup remote device to support app
    setupEnv)
        for botIndex in ${botList[@]}; do
            setup_env ${botIndex} ${usr} ${pwd}
        done
        ;;    
    setupExtras)
        for botIndex in ${botList[@]}; do
            setup_extras ${botIndex} ${usr} ${pwd}
        done
        ;;    
    
    # publish to device commands
    publish)
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            publish_all ${botIndex} ${usr} ${pwd}
        done
        ;;
    publishNode)
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            publish_node ${botIndex} ${usr} ${pwd}
            start_remote ${botIndex} ${usr} ${pwd}
        done
        ;;
    publishSwim)
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            publish_swim ${botIndex} ${usr} ${pwd}
            start_remote ${botIndex} ${usr} ${pwd}
        done
        ;;

    # quick update and restart remote sources
    updateRemote) 
        package_all
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            update_all ${botIndex} ${usr} ${pwd}
            start_remote ${botIndex} ${usr} ${pwd}
        done        
        ;;

    # quick update and restart remote sources
    updateNode) 
        package_node
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            update_node ${botIndex} ${usr} ${pwd}
            start_remote ${botIndex} ${usr} ${pwd}
        done        
        ;;

    # update, rebuild and restart remote sources and devices
    all) 
        package_all
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex}
        done
        for botIndex in ${botList[@]}; do
            publish_all ${botIndex} ${usr} ${pwd}
            start_remote ${botIndex} ${usr} ${pwd}
        done
        ;;

    # restart everything on remote device
    startRemote)
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        for botIndex in ${botList[@]}; do
            start_remote ${botIndex} ${usr} ${pwd}
        done
        ;;

    # stop everything on remote device
    stopRemote)
        for botIndex in ${botList[@]}; do
            stop_remote ${botIndex} ${usr} ${pwd}
        done
        ;;        
    snorlax) 
        snorlax
        ;;    
    *)
        help
        ;;
esac
printf "########## ${LTGREEN}${action} complete${NC} ##########\n"

