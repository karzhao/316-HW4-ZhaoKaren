const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MongoDatabaseManager = require('./mongodb');
const PostgreDatabaseManager = require('./postgre');

const vendor = (process.env.DB_VENDOR || 'mongodb').toLowerCase();

let manager;

switch (vendor) {
case 'postgres':
case 'postgresql':
    manager = new PostgreDatabaseManager();
    break;
case 'mongo':
case 'mongodb':
default:
    manager = new MongoDatabaseManager();
}

module.exports = manager;
