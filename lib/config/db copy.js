// import { Sequelize } from "sequelize";
// import mysql2 from "mysql2"; // இதை மேனுவலாக இம்போர்ட் செய்வது நல்லது

// //console.log("Connecting to DB:", process.env.DB_NAME);

// //const connectionString = `mysql://amigoweb_help-desk:amigoweb_help-desk@116.202.223.26:3306/amigoweb_help-desk`;

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     dialectModule: mysql2,
//     logging: false,
//   }
// );

// // const sequelize = new Sequelize(connectionString, {
// //   dialect: "mysql",
// //   dialectModule: mysql2,
// //   logging: false,
// // });

// export default sequelize;

import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

let sequelize;

// const connectionString = process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === "production";

if (!global.sequelize) {
  global.sequelize = new Sequelize(
    // process.env.DB_NAME,
    // process.env.DB_USER,
    // process.env.DB_PASS,
    connectionString,
    {
      dialect: "mysql",
      dialectModule: mysql2,
      logging: false,
      dialectOptions: {
        connectTimeout: 60000, // 60 seconds wait pannum
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    },
  );

  // Auto-Sync Logic
  (async () => {
    try {
      // Index file-ah import panna, ella models-um Sequelize-la register aayidum
      await import("@/lib/index.js");
      // console.log("DB.js Running");

      await global.sequelize.authenticate();
      // console.log("✅ MySQL connected successfully!");

      // Ella tables-um ippo automatic-ah sync aagum
      // await global.sequelize.sync({ alter: true });
      // console.log("✅ All Tables synced successfully!");
    } catch (error) {
      console.error("❌ DB Errors:", error);
    }
  })();
}

sequelize = global.sequelize;
export default sequelize;
