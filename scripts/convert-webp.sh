#!/usr/bin/env sh
set -e

magick convert -resize 800x500 -scene 1 ./public/$1/*.webp ./public/$1/%d.jpg
rm ./public/$1/*.webp
