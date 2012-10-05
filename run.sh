#!/bin/bash
 
#Check for Pano
export PATH=/Applications/Hugin/HuginTools:$PATH 
command -v pto_gen >/dev/null 2>&1 || { echo >&2 "Looks like Panotools isn't installed.  Aborting."; exit 1; }

node app.js
