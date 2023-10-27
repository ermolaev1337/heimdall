#!/bin/bash

IP_CA=localhost:8080
IP_ISSUER=localhost:8080
IP_HOLDER=localhost:8080


echo "Generate keys"

SEED_CA=1337
SEED_ISSUER=777
SEED_HOLDER=55555

echo "Generating secret keys and saving as files"
curl "http://$IP_CA/heimdalljs/key/new?seed=$SEED_CA" > ca_sk.txt
curl "http://$IP_ISSUER/heimdalljs/key/new?seed=$SEED_ISSUER" > issuer_sk.txt
curl "http://$IP_HOLDER/heimdalljs/key/new?seed=$SEED_HOLDER" > holder_sk.txt

SECRET_KEY_CA=$(< ca_sk.txt)
SECRET_KEY_ISSUER=$(< issuer_sk.txt)
SECRET_KEY_HOLDER=$(< holder_sk.txt)

echo "Deriving private keys and saving as files"
curl "http://$IP_ISSUER/heimdalljs/key/pub?private=$SECRET_KEY_ISSUER" > issuer_pk.json
curl "http://$IP_HOLDER/heimdalljs/key/pub?private=$SECRET_KEY_HOLDER" > holder_pk.json



echo "Saving attributes for the credential of the issuer"
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

echo "Uploading files to CA's Heimdall instance"
curl --request POST "http://$IP_CA/upload/file?name=attr_issuer.json" --form "uplfile=@attr_issuer.json"
curl --request POST "http://$IP_CA/upload/file?name=issuer_pk.json" --form "uplfile=@issuer_pk.json"
curl --request POST "http://$IP_CA/upload/file?name=ca_sk.txt" --form "uplfile=@ca_sk.txt"


REGISTRY=https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/

echo "Creating credential of the issuer by the CA"
curl "http://$IP_CA/heimdalljs/cred/new?attributes=attr_issuer.json&id=1234500&publicKey=issuer_pk.json&expiration=365&type=RegistrationOffice&delegatable=1&registry=$REGISTRY&secretKey=ca_sk.txt&destination=cred_issuer.json" > cred_issuer.json



echo "Writing attributes for the credential of the holder"
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

echo "Uploading files to issuers's Heimdall instance"
curl --request POST "http://$IP_ISSUER/upload/file?name=attr_holder.json" --form "uplfile=@attr_holder.json"
curl --request POST "http://$IP_ISSUER/upload/file?name=holder_pk.json" --form "uplfile=@holder_pk.json"
curl --request POST "http://$IP_ISSUER/upload/file?name=issuer_sk.txt" --form "uplfile=@issuer_sk.txt"


echo "Creating credential of the holder by the issuer"
curl "http://$IP_HOLDER/heimdalljs/cred/new?attributes=attr_holder.json&id=1234501&publicKey=holder_pk.json&expiration=365&type=IdentityCard&delegatable=0&registry=$REGISTRY&secretKey=issuer_sk.txt&destination=cred_holder.json" > cred_holder.json