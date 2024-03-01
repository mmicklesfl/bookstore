/** Common config for bookstore. */
require('dotenv').config();

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://marissa:${process.env.PG_PW}@localhost/books-test`;
} else {
  DB_URI = `postgresql://marissa:${process.env.PG_PW}@localhost/books`;
}

module.exports = { DB_URI };