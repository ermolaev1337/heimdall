#!/bin/bash

echo "---USE CASE---"
sh ../case-scripts/0-issuer.sh
wait
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