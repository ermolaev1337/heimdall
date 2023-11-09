#!/bin/bash
#Requires .env vars: IP_CA, SEED_CA

echo "Generate Private Key of CA, saving as ca_sk.txt"
curl -s "http://$IP_CA/heimdalljs/key/new?seed=$SEED_CA&name=ca_sk.txt" > ca_sk.txt