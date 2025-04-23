// require('dotenv').config();
const mongoose = require("mongoose");
const dbSrv = process.env.DATABASE_URI
mongoose.set('strictQuery', false);
mongoose.connect(dbSrv)
  .then(() => {
    console.log("Database connected");
  })
  .catch(err => {
    console.error("Error connecting to database:", err);
  });
const db = mongoose.connection;
module.exports = { db };






