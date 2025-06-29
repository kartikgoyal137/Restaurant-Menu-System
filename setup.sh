#!/bin/bash
echo "Setting up Restaurant Menu System... /kirito"
echo "Installing npm packages..."
npm install
cp .env.example .env
echo "Importing database..."
mysql -u root -p < velvetPlate.sql
echo "Add local variables to .env and run [node app.js]"
