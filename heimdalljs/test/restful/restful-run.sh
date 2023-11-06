#!/bin/bash

IP_CA=localhost:8080
IP_ISSUER=localhost:8080
IP_HOLDER=localhost:8080


echo "Generate keys"

SEED_CA=1337
SEED_ISSUER=777
SEED_HOLDER=55555

echo "Generating secret keys and saving as files"
curl -s "http://$IP_CA/heimdalljs/key/new?seed=$SEED_CA" > ca_sk.txt
curl -s "http://$IP_ISSUER/heimdalljs/key/new?seed=$SEED_ISSUER" > issuer_sk.txt
curl -s "http://$IP_HOLDER/heimdalljs/key/new?seed=$SEED_HOLDER" > holder_sk.txt

SECRET_KEY_CA=$(< ca_sk.txt)
SECRET_KEY_ISSUER=$(< issuer_sk.txt)
SECRET_KEY_HOLDER=$(< holder_sk.txt)

echo "Deriving private keys and saving as files"
curl -s "http://$IP_ISSUER/heimdalljs/key/pub?private=$SECRET_KEY_ISSUER" > issuer_pk.json
curl -s "http://$IP_HOLDER/heimdalljs/key/pub?private=$SECRET_KEY_HOLDER" > holder_pk.json



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
curl -s --request POST "http://$IP_CA/upload/file?name=attr_issuer.json" --form "uplfile=@attr_issuer.json"
curl -s --request POST "http://$IP_CA/upload/file?name=issuer_pk.json" --form "uplfile=@issuer_pk.json"
curl -s --request POST "http://$IP_CA/upload/file?name=ca_sk.txt" --form "uplfile=@ca_sk.txt"


REGISTRY=https://github.com/ermolaev1337/test-revoc.git
CREDENTIAL_ID_ISSUER=1234500

echo "Creating credential of the issuer by the CA"
curl -s "http://$IP_CA/heimdalljs/cred/new?attributes=attr_issuer.json&id=$CREDENTIAL_ID_ISSUER&publicKey=issuer_pk.json&expiration=365&type=RegistrationOffice&delegatable=1&registry=$REGISTRY&secretKey=ca_sk.txt&destination=cred_issuer.json" > cred_issuer.json



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
curl -s --request POST "http://$IP_ISSUER/upload/file?name=attr_holder.json" --form "uplfile=@attr_holder.json"
curl -s --request POST "http://$IP_ISSUER/upload/file?name=holder_pk.json" --form "uplfile=@holder_pk.json"
curl -s --request POST "http://$IP_ISSUER/upload/file?name=issuer_sk.txt" --form "uplfile=@issuer_sk.txt"


CREDENTIAL_ID_HOLDER=1234501

echo "Creating credential of the holder by the issuer"
curl -s "http://$IP_ISSUER/heimdalljs/cred/new?attributes=attr_holder.json&id=$CREDENTIAL_ID_HOLDER&publicKey=holder_pk.json&expiration=365&type=IdentityCard&delegatable=0&registry=$REGISTRY&secretKey=issuer_sk.txt&destination=cred_holder.json" > cred_holder.json


echo "Uploading files to holder's Heimdall instance"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=cred_holder.json" --form "uplfile=@cred_holder.json"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=holder_sk.txt" --form "uplfile=@holder_sk.txt"

CHALLENGE=1231423534

echo "Generate the presentation of the attribute by holder (before revocation)"
curl -s "http://$IP_HOLDER/heimdalljs/pres/attribute?index=10&expiration=100&challenge=$CHALLENGE&secretKey=holder_sk.txt&destination=pres_attribute_before_revocation.json&credential=cred_holder.json" > pres_attribute_before_revocation.json

echo "Verify the attribute presentation (should be verifier, it will be agent)"
curl -s "http://$IP_HOLDER/heimdalljs/verify?path=pres_attribute_before_revocation.json" > verification-result-before-revocation.txt

echo "Revoke the cred"
source .env
curl -s "http://$IP_ISSUER/heimdalljs/revoc/update?index=$CREDENTIAL_ID_HOLDER&token=$GITHUB_TOKEN" > revocation-result.txt

echo "Generate the presentation of the attribute by holder (after revocation)"
curl -s "http://$IP_HOLDER/heimdalljs/pres/attribute?index=10&expiration=100&challenge=$CHALLENGE&secretKey=holder_sk.txt&destination=pres_attribute_after_revocation.json&credential=cred_holder.json" > pres_attribute_after_revocation.json


echo "Verify the attribute presentation (should be verifier, it will be agent)"
curl -s "http://$IP_HOLDER/heimdalljs/verify?path=pres_attribute_after_revocation.json" > verification-result-after-revocation.txt


