#!/usr/bin/env sh
set -e

mkdir -p ./public/$1
magick convert -resize 900x600 -sharpen 0x0.5 -scene 1 ./sources/$1/[1-6].* ./public/$1/%d.jpg
magick convert -define jpeg:size=400x400 ./sources/$1/1.* -thumbnail 200x200^ -gravity center -extent 200x200 +profile "*" ./public/$1/0.jpg
