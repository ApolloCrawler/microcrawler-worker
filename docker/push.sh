#! /usr/bin/env sh

PACKAGE_VERSION=$(cat ../../../package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

docker push korczis/microcrawler-worker:$PACKAGE_VERSION
docker push korczis/microcrawler-worker:latest