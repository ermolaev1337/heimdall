#!/bin/bash
#Requires .env vars: IP_VERIFIER

CHALLENGE_1=$(cat challenge_1.txt)

echo "Verifying Attribute Presentation of Holder, saving as verification-result-before-revocation.txt"
curl -s "http://$IP_VERIFIER/heimdalljs/verify?path=pres_attribute_before_revocation.json&name=verification-result-before-revocation.txt&publicKey=issuer_pk.json&challenge=$CHALLENGE_1" > verification-result-before-revocation.txt
