#!/usr/bin/env sh
set -e

magick convert -resize 900x600 -scene 1 ./public/$1/*.webp ./public/$1/%d.jpg
rm ./public/$1/*.webp
