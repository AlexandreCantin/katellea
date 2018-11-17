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
./restore-dev-database.sh katellea 27030 127.0.0.1
sleep 5


echo ""
echo ""
echo "-------------------------"
echo "--- Start Node server ---"
echo "-------------------------"
echo ""
cd /katellea
npm run start&
sleep 5
clear

# Start nightwatch
echo ""
echo ""
echo "-------------------------"
echo "---- Start e2e tests ----"
echo "-------------------------"
echo ""
nightwatch

sleep 5
chmod 777 /katellea/tests/e2e/reports
chmod 777 /katellea/frontend/build/
echo ""
echo "End of testing"
echo ""