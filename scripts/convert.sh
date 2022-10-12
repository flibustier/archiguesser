#!/usr/bin/env sh
set -e

mkdir -p ./public/$1
magick convert -resize 900x600 -scene 1 ./sources/$1/* ./public/$1/%d.jpg
