#!/usr/bin/env sh
set -e

magick convert -resize 800x500 -quality 80 -scene 1 ./public/$1/*.jpg ./public/$1/%d.jpg
