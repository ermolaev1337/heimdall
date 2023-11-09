#!/bin/bash
#Requires .env vars: IP_HOLDER, PRESENTATION_EXPIRATION_SECONDS_2, PRESENTATION_CHALLENGE_2

echo "Getting expiration and challenge from .env, saving as expiration_2.txt, and challenge_2.txt"
echo $PRESENTATION_EXPIRATION_SECONDS_2 > expiration_2.txt
echo $PRESENTATION_CHALLENGE_2 > challenge_2.txt

echo "Uploading expiration and challenge to Heimdall of Holder to request Attribute Presentation from Holder, saving as expiration_2.txt, and challenge_2.txt"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=expiration_2.txt" --form "uplfile=@expiration_2.txt"
curl -s --request POST "http://$IP_HOLDER/upload/file?name=challenge_2.txt" --form "uplfile=@challenge_2.txt"
