echo "Setting up Restaurant Menu System... /kirito"

echo "Installing npm packages..."
npm install

cp .env.example .env

echo "Importing database..."
mysql -u root -p < velvetPlate.sql

echo "Starting the app..."
node app.js