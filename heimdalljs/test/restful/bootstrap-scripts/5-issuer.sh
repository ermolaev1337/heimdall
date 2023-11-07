#!/bin/bash
#Requires .env vars: IP_ISSUER, IP_HOLDER, REGISTRY, CREDENTIAL_ID_HOLDER

echo "Creating Credential for Holder by Issuer, saving as cred_holder.json"
curl -s "http://$IP_ISSUER/heimdalljs/cred/new?attributes=attr_holder.json&id=$CREDENTIAL_ID_HOLDER&publicKey=holder_pk.json&expiration=365&type=IdentityCard&delegatable=0&registry=$REGISTRY&secretKey=issuer_sk.txt&destination=cred_holder.json" > cred_holder.json

echo "Uploading Credential of Holder to Heimdall of Holder, saving as cred_holder.json"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=cred_holder.json" --form "uplfile=@cred_holder.json"
