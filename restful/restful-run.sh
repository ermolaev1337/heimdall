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

echo "---USE CASE---"
sh ../case-scripts/1-verifier.sh
wait
sh ../case-scripts/2-holder.sh
wait
sh ../case-scripts/3-verifier.sh
wait
sh ../case-scripts/4-issuer.sh
wait
sh ../case-scripts/5-verifier.sh
wait
sh ../case-scripts/6-holder.sh
wait
sh ../case-scripts/7-verifier.sh
wait