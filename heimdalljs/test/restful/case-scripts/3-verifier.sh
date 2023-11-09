#!/bin/bash
#Requires .env vars: IP_VERIFIER

echo "Verifying Attribute Presentation of Holder, saving as verification-result-before-revocation.txt"
curl -s "http://$IP_VERIFIER/heimdalljs/verify?path=pres_attribute_before_revocation.json&name=verification-result-before-revocation.txt" > verification-result-before-revocation.txt
