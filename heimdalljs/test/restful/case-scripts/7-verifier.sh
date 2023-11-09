#!/bin/bash
#Requires .env vars: IP_VERIFIER

echo "Verifying Attribute Presentation of Holder, saving as verification-result-after-revocation.txt"
curl -s "http://$IP_VERIFIER/heimdalljs/verify?path=pres_attribute_after_revocation.json&name=verification-result-after-revocation.txt" > verification-result-after-revocation.txt
