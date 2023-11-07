#!/bin/bash
#Requires .env vars: IP_HOLDER, SEED_HOLDER, IP_ISSUER

echo "Generate Private Key of Holder, saving as holder_sk.txt"
curl -s "http://$IP_HOLDER/heimdalljs/key/new?seed=$SEED_HOLDER&name=holder_sk.txt" > holder_sk.txt

echo "Deriving Public Key of Holder, saving as holder_pk.json"
curl -s "http://$IP_HOLDER/heimdalljs/key/pub?private=holder_sk.txt&name=holder_pk.json" > holder_pk.json

echo "Saving Attributes for Credential of Holder as attr_holder.json"
cat <<EOM > attr_holder.json
[
	"John",
	"Jones",
	"male",
	"843995700",
	"blue",
	"180",
	"115703781",
	"499422598"
]
EOM

echo "Uploading files of Holder (Attributes for Credential, and Public Key) to Heimdall of Issuer, saving as attr_holder.json, and holder_pk.json"
curl -s --request POST "http://$IP_ISSUER/upload/file?name=attr_holder.json" --form "uplfile=@attr_holder.json"
curl -s --request POST "http://$IP_ISSUER/upload/file?name=holder_pk.json" --form "uplfile=@holder_pk.json"

