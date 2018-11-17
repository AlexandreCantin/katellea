#!/bin/bash

# Install mongo/mongoimport
# ==> sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
# ==> echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
# ==> sudo apt-get update
# ==> sudo apt-get install mongodb-clients


# ==> DO NOT USE IN PRODUCTION <==

DB=$1
if [ -z $DB ]
then
  DB='katellea'
fi

PORT=$2
if [ -z $PORT ]
then
  PORT='27017'
fi

HOST=$3
if [ -z $HOST ]
then
  HOST='127.0.0.1'
fi

SAVE_DIR=$DB-save

# Drop and create date database
# Note : for installing mongo => sudo apt install mongodb-clients
mongo $DB --port $PORT --eval "db.dropDatabase();" --host $HOST

for filepath in $SAVE_DIR/*.json; do
  # Extract collection
  filename=`echo $filepath | cut -d'/' -f 2`
  collection=`echo $filename | cut -d'.' -f 1`

  mongoimport --db $DB --port $PORT --collection $collection < $filepath --host $HOST
done