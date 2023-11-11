#!/bin/bash
#Requires .env vars: IP_VERIFIER

echo "Uploading Public Key of Issuer to Heimdall of Verifier to verify against it later, saving as issuer_pk.json"
curl -s --request POST "http://$IP_VERIFIER/upload/file?name=issuer_pk.json" --form "uplfile=@issuer_pk.json"