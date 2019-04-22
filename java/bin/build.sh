#!/usr/bin/env bash

build() {
  ./gradlew clean build buoy
}

package() {
  /bin/rm -rf ${workspace}
  mkdir -p ${workspace}

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

  for f in $(find ./build/libs -type f); do
    if [ ! -d ${f} ]; then
      cp ${f} ${path}
      if [ "${f##*.}" = "buoy" ]; then
        nv=${f##*/}
        if [ ! "${nv}" == ${nv%%.*} ]; then
          (cd ${path}; ln -s ${nv} ${nv%%.*})
        fi
      fi
    fi
  done

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

version=$(./gradlew properties | grep swim.version | cut -d: -f2)
version=${version// /}
[[ "${version}" == *-SNAPSHOT ]] && release=ea
majmin=$(echo ${version} | cut -d. -f1,2)
workspace=/tmp/workspace
gap=${workspace}/gap
user=swim-honeybadger
email=swim.honeybadger@gmail.com
prefix=${workspace}/files
wd=`pwd`

for arg in ${@}; do
  case "${arg}" in
    build) build;;
    publish) publish;;
    *) build;; # publish;;
  esac
done
