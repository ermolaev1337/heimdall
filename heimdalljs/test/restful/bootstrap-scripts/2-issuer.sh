#!/bin/bash
#Requires .env vars: IP_ISSUER, IP_CA, SEED_ISSUER

echo "Generate Private Key of Issuer, saving as issuer_sk.txt"
curl -s "http://$IP_ISSUER/heimdalljs/key/new?seed=$SEED_ISSUER&name=issuer_sk.txt" > issuer_sk.txt

echo "Deriving Public Key of Issuer, saving as issuer_pk.json"
curl -s "http://$IP_ISSUER/heimdalljs/key/pub?private=issuer_sk.txt&name=issuer_pk.json" > issuer_pk.json

echo "Saving Attributes for Credential of Issuer as attr_issuer.json"
cat <<EOM > attr_issuer.json
[
	"Egor",
	"Ermolaev",
	"male",
	"843995700",
	"brown",
	"182",
	"115703781",
	"499422598"
]
EOM

echo "Uploading files of Issuer (Attributes for Credential, and Public Key) to Heimdall of CA, saving as attr_issuer.json, and issuer_pk.json"
curl -s --request POST "http://$IP_CA/upload/file?name=attr_issuer.json" --form "uplfile=@attr_issuer.json"
curl -s --request POST "http://$IP_CA/upload/file?name=issuer_pk.json" --form "uplfile=@issuer_pk.json"

