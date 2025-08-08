#!/usr/bin/env sh

# abort on errors
set -e

cdate=$(date +"%m-%d-%Y")

deno task build

cd dist

git add -A
git commit -m $cdate

git push git@github.com:flibustier/archiguesser.git gh-pages

cd -
