echo ""
echo "-------------------------"
echo "---- Start mongoDB  -----"
echo "-------------------------"
echo ""
mongod --port 27030 --bind_ip 0.0.0.0&
sleep 20

echo ""
echo "-------------------------"
echo "----- Build front -------"
echo "-------------------------"
echo ""
npm run build --prefix frontend

echo ""
echo ""
echo "-------------------------"
echo "---- Seeding database ---"
echo "-------------------------"
echo ""
# Seeding database
cd ./conf/
./restore-dev-database.sh katellea 27030 127.0.0.1 true
sleep 20


echo ""
echo ""
echo "-------------------------"
echo "--- Start Node server ---"
echo "-------------------------"
echo ""
# Copy index index.html to index.ejs
cp /katellea/frontend/build/index.html /katellea/src/templates/index.ejs

cd /katellea
npm run start&
sleep 10
clear

# Start nightwatch
echo ""
echo ""
echo "-------------------------"
echo "---- Start e2e tests ----"
echo "-------------------------"
echo ""
nightwatch

sleep 10
chmod 777 /katellea/tests/e2e/reports
chmod 777 /katellea/frontend/build/
rm /katellea/src/templates/index.ejs

echo ""
echo "End of testing"
echo ""