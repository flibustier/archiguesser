#!/bin/bash
set -e

for i in $(seq 1 $1)
do
    magick convert -define jpeg:size=400x400 ./public/$i/1.jpg -thumbnail 200x200^ -gravity center -extent 200x200 +profile "*" ./public/$i/thumb.jpg
done
