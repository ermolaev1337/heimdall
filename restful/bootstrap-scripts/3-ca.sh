#!/bin/bash
#Requires .env vars: IP_CA, IP_ISSUER, REGISTRY, CREDENTIAL_ID_ISSUER

echo "Creating Credential for Issuer (RegistrationOffice type) by CA, saving as cred_issuer.json"
curl -s "http://$IP_CA/heimdalljs/cred/new?attributes=attr_issuer.json&id=$CREDENTIAL_ID_ISSUER&publicKey=issuer_pk.json&expiration=365&type=RegistrationOffice&delegatable=1&registry=$REGISTRY&secretKey=ca_sk.txt&destination=cred_issuer.json" > cred_issuer.json

echo "Uploading Credential of Issuer to Heimdall of Issuer, saving as cred_issuer.json"
curl -s --request POST "http://$IP_ISSUER/upload/file?name=cred_issuer.json" --form "uplfile=@cred_issuer.json"

