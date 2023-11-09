#!/bin/bash
#Requires .env vars: IP_VERIFIER

CHALLENGE_2=$(cat challenge_2.txt)

echo "Verifying Attribute Presentation of Holder, saving as verification-result-after-revocation.txt"
curl -s "http://$IP_VERIFIER/heimdalljs/verify?path=pres_attribute_after_revocation.json&name=verification-result-after-revocation.txt&publicKey=issuer_pk.json&challenge=$CHALLENGE_2" > verification-result-after-revocation.txt
