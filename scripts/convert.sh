#!/usr/bin/env sh
set -e

if [[ "$1" == categories ]]
then
    magick convert -define jpeg:size=400x400 ./sources/$1/* -thumbnail 200x200^ -gravity center -extent 200x200 +profile "*" -set filename:base "%[basename]" "./public/categories/%[filename:base].jpg"
else
    mkdir -p ./public/$1
    magick convert -interlace plane -strip -quality 85 -resize 1300x600 -sharpen 0x0.5 -auto-orient -scene 1 ./sources/$1/[1-6].* ./public/$1/%d.jpg
    magick convert -interlace plane -strip -define jpeg:size=400x400 ./sources/$1/1.* -thumbnail 200x200^ -gravity center -extent 200x200 +profile "*" ./public/$1/0.jpg
    echo "http://localhost:4000/?day=$1"
fi
