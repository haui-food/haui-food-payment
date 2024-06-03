require('dotenv').config();

const username = process.env.DATABASE_MONGO_USERNAME;
const password = process.env.DATABASE_MONGO_PASSWORD;
const host = process.env.DATABASE_MONGO_HOST;
const port = process.env.DATABASE_MONGO_PORT;
const database = process.env.DATABASE_MONGO_NAME;
const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';

const typeDatabase = process.env.DATABASE_MONGO_TYPE || 'local';

let uri = '';
if (typeDatabase === 'local') {
  uri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
} else if (typeDatabase === 'cloud') {
  uri = `mongodb+srv://${username}:${password}@${host}/${database}?authSource=${authSource}`;
}

module.exports = uri;
