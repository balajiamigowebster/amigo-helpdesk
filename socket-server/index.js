const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const sequalize = require("./config/db");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

console.log("Restarted at:", new Date().toLocaleTimeString());

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: ["http://localhost:3000", "https://help-desk-amigo.vercel.app"],
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
  }),
);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://help-desk-amigo.vercel.app"],
    methods: ["GET", "PUT", "POST", "DELETE"],
  },
});

// --- API ROUTES ---
app.use("/api/trigger-ticket", (req, res) => {
  res.send("Hello");
  const ticketData = req.body;
  io.emit("new-ticket-alert", ticketData);
  res.status(200).json({ success: true });
});

// 1. Health Check (Browser-la check panna)
app.get("/", (req, res) => {
  res.send("🚀 Socket Server is LIVE!  comme");
});

// --- BOOT FUNCTION ---
const startServer = async () => {
  try {
    await sequalize.authenticate();
    console.log(
      `✅ MySQL connected to ${isProduction ? "Production" : "Local"} DB!`,
    );

    if (!isProduction) {
      console.log("🛠️ Syncing DB (alter: true)...");

      // Sync aagaradhukku munnadi ellaa models-ayum inga import pannanum
      // require('./models/Ticket');
      //   await sequalize.sync({ alter: true });
      console.log("✅ DB Tables Synced!");
    }

    const PORT = process.env.PORT || 5178;
    server.listen(PORT, () => {
      console.log(
        `🚀 Socket Server running in ${isProduction ? "PROD" : "DEV"} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Server Start Error:", error);
  }
};

startServer();

// app.listen(5177, () => {
//   console.log("Server Running  Success");
// });
