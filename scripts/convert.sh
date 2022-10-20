#!/usr/bin/env sh
set -e

mkdir -p ./public/$1
magick convert -resize 900x600 -scene 1 ./sources/$1/* ./public/$1/%d.jpg
magick convert -resize 200x200 ./sources/$1/1.jpg ./public/$1/thumb.jpg
