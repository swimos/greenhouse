#!/usr/bin/env bash

build() {
  echo 'build'
  ./bin/buildNode.sh "$0"
}

package() {
  /bin/rm -rf ${workspace}
  mkdir -p ${workspace}/dist

  echo "echo ${SWIM_ARTIFACTORY_USER_PASSWORD}" > ${gap}
  chmod 755 ${gap}
  export GIT_ASKPASS=${gap}

  (cd ${workspace}
    git clone --depth 1 https://${user}@github.com/swimit/files.git
    cd ${prefix}
    git config user.name ${user}
    git config user.email ${email})

  project=swim-greenhouse
  path=${prefix}/${project}/${majmin}/${release:+${release}/}${version}
  mkdir -p ${path}

  cp -r ./javascript ${workspace}/dist/javascript
  mkdir -p ${workspace}/dist/config/node
  cp -r ./config/node ${workspace}/dist/config/node
  mkdir -p ${workspace}/dist/bin
  cp -r ./bin ${workspace}/dist/
  
  f=${project}-${version}.zip

  (cd ${workspace}/dist
    zip -r ${f} ./
    cp ${f} ${path}
    cp ${f} ${wd})

  (cd ${path}/../..${release:+/..}
    /bin/rm -f latest${release:+-${release}}
    ln -s ${majmin}/${release:+${release}/}${version} latest${release:+-${release}})
  [[ -v release ]] && \
    (cd ${path}/../..
      /bin/rm -f latest${release:+-${release}}
      ln -s ${release:+${release}/}${version} latest${release:+-${release}})
  (cd ${path}/..; /bin/rm -f latest; ln -s ${version} latest)
}

publish() {
  package
  (cd ${prefix}; git pull; git add .; git commit -m "build"; git push)
}

version=$(cd java;
  ./gradlew properties | grep swim.version | cut -d: -f2)

version=${version// /}
[[ "${version}" == *-SNAPSHOT ]] && release=ea
majmin=$(echo ${version} | cut -d. -f1,2)
workspace=/tmp/workspace
gap=${workspace}/gap
user=swim-honeybadger
email=swim.honeybadger@gmail.com
prefix=${workspace}/files
wd=`pwd`

args=$((( $# == 0 ))  && echo "build publish" || echo ${@})

for arg in ${args}; do
  case "${arg}" in
    build) build;;
    publish) publish;;
    *) echo "usage: ${0} [ build | publish ]";;
  esac
done
