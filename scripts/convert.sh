#!/usr/bin/env sh
set -e

mkdir -p ./public/$1
magick convert -resize 900x600 -scene 1 ./sources/$1/* ./public/$1/%d.jpg
magick convert -define jpeg:size=400x400 ./sources/$i/1.jpg -thumbnail 200x200^ -gravity center -extent 200x200 +profile "*" ./public/$i/0.jpg
