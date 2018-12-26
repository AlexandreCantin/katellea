#!/bin/bash

# ==> DO NOT USE IN PRODUCTION <==
# This is only a minimal mongoDB save script.
# Useful for transfer database to an other developper.

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

COLLECTIONS=$(mongo $HOST:$PORT/$DB -u katellea -p katellea_pwd --quiet --eval "db.getCollectionNames()" | sed 's/\[/ /g' | sed 's/\]/ /g' | sed 's/,/ /g' | sed 's/"/ /g')
mkdir $SAVE_DIR

for collection in $COLLECTIONS; do
    echo "Exporting $DB/$collection ..."
    mongoexport --forceTableScan -d $DB -u katellea -p katellea_pwd -c $collection -o $SAVE_DIR/$collection.json
done