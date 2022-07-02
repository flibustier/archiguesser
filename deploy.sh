#!/usr/bin/env sh

# abort on errors
set -e

yarn build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f -u https://github.com/flibustier/archiguesser.git gh-pages

cd -
