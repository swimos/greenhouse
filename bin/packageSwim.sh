#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh
botNumber=${1}
usr=${2}
pwd=${3}
botName="Raspi${botNumber}"
build_dir=${path}/build
dist_dir=${path}/dist
src_dir=${path}/java
full_file_name="${FILENAME}-java-${VERSION}.tar.gz"

printf "${GREY}Package SWIM for deployment${NC}\n"

rm -rf ${build_dir}
mkdir -p ${build_dir}
mkdir -p ${dist_dir}
rm ${dist_dir}/${full_file_name}

${path}/bin/stopSwim.sh
# ${path}/bin/buildSwim.sh config="$botName"
# printf "*${GREY} copy build to dist${NC}\n"
# cp -R ${src_dir}/dist ${build_dir}/dist

printf "${GREY}copy to build folder${NC}\n"
cp -R ${src_dir}/src ${build_dir}/src
cp -R ${src_dir}/.classpath ${build_dir}
cp -R ${src_dir}/.project ${build_dir}
cp -R ${src_dir}/gradle ${build_dir}
cp -R ${src_dir}/gradlew ${build_dir}
cp -R ${src_dir}/gradlew.bat ${build_dir}
cp -R ${src_dir}/build.gradle ${build_dir}
cp -R ${src_dir}/gradle.properties ${build_dir}

printf "${GREY}tar the build${NC}\n"
cd ${build_dir}
tar -zcvf ${full_file_name} *

printf "${GREY}move tar to dist${NC}\n"
mv ${full_file_name} ${dist_dir}/${full_file_name}

printf "${GREEN}Done.${NC}\n"