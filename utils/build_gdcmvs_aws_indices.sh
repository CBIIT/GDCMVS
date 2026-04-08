#!/bin/bash
# DESC rebuild gdc-mvs indices

# get token for access on nciws-d2630-c
export TOKEN=$(curl -fsS -k -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -fsS -H "X-aws-ec2-metadata-token: $TOKEN" -k "http://localhost:3000/search/buildIndex"
echo " "

