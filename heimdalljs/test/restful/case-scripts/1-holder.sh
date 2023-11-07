#!/bin/bash
#Requires .env vars: IP_HOLDER, CHALLENGE_1, IP_VERIFIER

echo "Generate Attribute Presentation for Holder, saving as pres_attribute_before_revocation.json"
curl -s "http://$IP_HOLDER/heimdalljs/pres/attribute?index=10&expiration=100&challenge=$CHALLENGE_1&secretKey=holder_sk.txt&destination=pres_attribute_before_revocation.json&credential=cred_holder.json" > pres_attribute_before_revocation.json

echo "Uploading Attribute Presentation of Holder to Heimdall of Verifier, saving as pres_attribute_before_revocation.json"
curl -s --request POST "http://$IP_VERIFIER/upload/file?name=pres_attribute_before_revocation.json" --form "uplfile=@pres_attribute_before_revocation.json"
