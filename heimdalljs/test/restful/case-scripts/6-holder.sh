#!/bin/bash
#Requires .env vars: IP_HOLDER, IP_VERIFIER

EXPIRATION_2=$(cat expiration_2.txt)
CHALLENGE_2=$(cat challenge_2.txt)

echo "Generate Attribute Presentation for Holder, saving as pres_attribute_after_revocation.json"
curl -s "http://$IP_HOLDER/heimdalljs/pres/attribute?index=10&expiration=$EXPIRATION_2&challenge=$CHALLENGE_2&secretKey=holder_sk.txt&destination=pres_attribute_after_revocation.json&credential=cred_holder.json" > pres_attribute_after_revocation.json

echo "Uploading Attribute Presentation of Holder to Heimdall of Verifier, saving as pres_attribute_after_revocation.json"
curl -s --request POST "http://$IP_VERIFIER/upload/file?name=pres_attribute_after_revocation.json" --form "uplfile=@pres_attribute_after_revocation.json"
