#!/bin/bash

project="jncc-web-api"
host="esdm-xen1-04.esdm.co.uk"
livehost="ec2-63-34-227-23.eu-west-1.compute.amazonaws.com"
user="esdm"
remotepath="/home/esdm/dotnet-published"

echo "Running Deploy to Live Task on server...."
ssh $user@$host "mkdir $remotepath 2>/dev/null; rsync -e ssh -zauvE --delete --progress --exclude=appsettings.json $remotepath/$project $user@$livehost:$remotepath"
[ $? -ne 0 ] && echo "Deploy to Live Task Failed!" && exit 1