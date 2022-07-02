#!/usr/bin/env sh

# abort on errors
set -e

yarn build

cd dist

git add -A
git commit -m '$(date)'

git push git@github.com:flibustier/archiguesser.git gh-pages

cd -
