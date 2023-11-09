#!/bin/bash

echo "---BOOTSTRAP---"
sh ../bootstrap-scripts/1-ca.sh
wait
sh ../bootstrap-scripts/2-issuer.sh
wait
sh ../bootstrap-scripts/3-ca.sh
wait
sh ../bootstrap-scripts/4-holder.sh
wait
sh ../bootstrap-scripts/5-issuer.sh
wait