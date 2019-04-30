#!/usr/bin/env bash

#file info
FILENAME='swim-greenhouse'
INSTALL_FOLDER='swim-greenhouse-runtime'
VERSION="1.0"

#colors
RED='\033[0;31m'
GREEN='\033[0;32m'
LTGREEN='\033[1;32m'
BLUE='\033[0;34m'
GREY='\033[1;30m'
NC='\033[0m' # No Color

#get system version values
OS_PRETTY_NAME=`cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2`
OS_PRETTY_NAME="${OS_PRETTY_NAME%\"}"
OS_PRETTY_NAME="${OS_PRETTY_NAME#\"}"

OS_NAME=$( echo "$OS_PRETTY_NAME" | cut -d' ' -f1 )

OS_VERSION=`cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2`
OS_VERSION="${OS_VERSION%\"}"
OS_VERSION="${OS_VERSION#\"}"

declare -A ipList=(
  [0]="127.0.0.1"
  [1]="greenhouse.swim.ai"
  [2]="192.168.1.103"
  [3]="192.168.10.58"
  [4]="192.168.0.204"
  [5]="192.168.1.79"
  [6]="192.168.1.85"
  [7]="192.168.10.57"
  [8]="192.168.0.208"
  [9]="192.168.1.82"
  [10]="192.168.1.94"
  [11]="192.168.0.211"
  [12]="192.168.10.51"
  [13]="192.168.0.213"
  [14]="192.168.0.214"
  [15]="raspi15"
  [16]="raspi16"
  [17]="192.168.0.217"
  [18]="192.168.0.218"
  [19]="192.168.0.219"
  [20]="192.168.0.220"
)

declare -A startPages=(
    [0]="http://127.0.0.1:8080/"
    [1]="http://greenhouse.swim.ai:8080/zones"
    [2]="http://127.0.0.1:8080/plantMon"
    [3]="http://127.0.0.1:8080/aggregate"
    [4]="http://127.0.0.1:8080/plantMon"
    [5]="http://127.0.0.1:8080/senseHat"
    [6]="http://127.0.0.1:8080/senseHat"
    [7]="http://127.0.0.1:8080/senseHat"
    [8]="http://127.0.0.1:8080/senseHat"
    [9]="http://127.0.0.1:8080/aggregate"
    [10]="http://127.0.0.1:8080/plant"
    [11]="http://127.0.0.1:8080/"
    [12]="http://127.0.0.1:8080/plantMon"
    [13]="http://127.0.0.1:8080/plantMon"
    [14]="http://127.0.0.1:8080/zones"
    [15]="http://127.0.0.1:8080/plantMon"
    [16]="http://127.0.0.1:8080/plantMon"
    [17]="http://127.0.0.1:8080/"
    [18]="http://127.0.0.1:8080/"
    [19]="http://127.0.0.1:8080/"
    [20]="http://127.0.0.1:8080/"
)
