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

NO_USER=$4

SAVE_DIR=$DB-save

# Drop and create date database
# Note : for installing mongo => sudo apt install mongodb-clients
if [ $NO_USER ]
then mongo $DB --port $PORT --eval "db.dropDatabase();" --host $HOST
else mongo $DB --port $PORT -u root -p root --eval "db.dropDatabase();" --host $HOST --authenticationDatabase "admin"
fi

for filepath in $SAVE_DIR/*.json; do
  # Extract collection
  filename=`echo $filepath | cut -d'/' -f 2`
  collection=`echo $filename | cut -d'.' -f 1`

  if [ $NO_USER ]
  then mongoimport --db $DB --port $PORT --collection $collection < $filepath --host $HOST
  else mongoimport --db $DB --port $PORT -u katellea -p katellea_pwd --collection $collection < $filepath --host $HOST
fi

done