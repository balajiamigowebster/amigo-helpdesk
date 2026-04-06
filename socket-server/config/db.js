const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");
// Local-la development pannumbodhu current folder .env-ah edukkum
require("dotenv").config();

// Automatic Detection
const isProduction = process.env.NODE_ENV === "production";

// console.log(
//   `🚀 Running in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode`,
// );

let sequalize;

if (isProduction) {
  // PRODUCTION: Remote Database using Connection String
  console.log("🚀 Connecting to  Production Remote Database...");
  sequalize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
    },
    pool: {
      // max:5, // Production-la socket server-ku 5 connections podhum
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  });
} else {
  // DEVELOPMENT: Local HeidiSQL using Separate Credentials
  console.log("💻 Connecting to Local HeidiSQL (127.0.0.1)...");
  sequalize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      dialectModule: mysql2,
      logging: false,
    },
  );
}

module.exports = sequalize;
