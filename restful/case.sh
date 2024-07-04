#!/bin/bash

echo "---USE CASE---"
sh ../case-scripts/2-verifier.sh
wait
sh ../case-scripts/3-holder.sh
wait
sh ../case-scripts/4-verifier.sh
wait
sh ../case-scripts/5-issuer.sh
wait
sh ../case-scripts/6-verifier.sh
wait
sh ../case-scripts/7-holder.sh
wait
sh ../case-scripts/8-verifier.sh
wait