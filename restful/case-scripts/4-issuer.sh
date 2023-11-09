#!/bin/bash
#Requires .env vars: IP_ISSUER, CREDENTIAL_ID_HOLDER, GITHUB_TOKEN

echo "Revoke Credential of Holder, saving as revocation-result.txt"
curl -s "http://$IP_ISSUER/heimdalljs/revoc/update?index=$CREDENTIAL_ID_HOLDER&token=$GITHUB_TOKEN&name=revocation-result.txt" > revocation-result.txt
