#!/bin/bash
#Requires .env vars: IP_HOLDER, PRESENTATION_EXPIRATION_SECONDS_1, PRESENTATION_CHALLENGE_1

echo "Getting expiration and challenge from .env, saving as expiration_1.txt, and challenge_1.txt"
echo $PRESENTATION_EXPIRATION_SECONDS_1 > expiration_1.txt
echo $PRESENTATION_CHALLENGE_1 > challenge_1.txt

echo "Uploading expiration and challenge to Heimdall of Holder to request Attribute Presentation from Holder, saving as expiration_1.txt, and challenge_1.txt"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=expiration_1.txt" --form "uplfile=@expiration_1.txt"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=challenge_1.txt" --form "uplfile=@challenge_1.txt"
