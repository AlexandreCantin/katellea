#!/bin/bash

# ==> DO NOT USE IN PRODUCTION <==
# This is only a minimal mongoDB save script.
# Useful for transfer database to an other developper.

DB=$1
if [ -z $DB ]
then
  DB='katellea'
fi

SAVE_DIR=$DB-save

COLLECTIONS=$(mongo localhost:27017/$DB --quiet --eval "db.getCollectionNames()" | sed 's/,/ /g')
mkdir $SAVE_DIR

for collection in $COLLECTIONS; do
    echo "Exporting $DB/$collection ..."
    mongoexport -d $DB -c $collection -o $SAVE_DIR/$collection.json
done