# AR Indoor Mapping

## Pano

PanoTools is an image processing library that comes as part of the panorama GUI tool Hugin. The latest dev version is downloadable here:
http://www.macupdate.com/app/mac/18575/hugin

Ignoring the GUI side, it is fairly easy to write a bash script to take all the images in a folder, process them and generate a patchwork composite from them.

Inside this folder here:
https://www.dropbox.com/sh/lusxcyl85hkkp9e/r3M49fF2Hg

You'll find a script that takes a file pattern as an argument and then tells PanoTools to do all the clever stuff.

Assuming you've got Hugin installed in /Applications/Hugin/ , you should be able to cd into the folder of sample pictures and run 
$ ./pano.sh A*.JPG
or
$ ./pano.sh D*.JPG
