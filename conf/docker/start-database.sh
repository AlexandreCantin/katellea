echo 'Creating application user and db'

mongo ${MONGO_INITDB_DATABASE} \
        --host localhost \
        -u ${MONGO_INITDB_ROOT_USERNAME} \
        -p ${MONGO_INITDB_ROOT_PASSWORD} \
        --authenticationDatabase admin \
        --eval "db.createUser({user: '${MONGODB_USERNAME}', pwd: '${MONGODB_PASSWORD}', roles:[{role:'readWrite', db: '${MONGO_INITDB_DATABASE}'}]});"