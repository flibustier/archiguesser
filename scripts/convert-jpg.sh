#!/usr/bin/env sh
set -e

magick convert -resize 900x600 -quality 90 -scene 1 ./public/$1/*.jpg ./public/$1/%d.jpg
