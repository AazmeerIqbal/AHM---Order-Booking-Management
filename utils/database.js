const sql = require("mssql");

const config = {
  user: "sa",
  password: "test",
  server: "AZMEER",
  database: "AHDenim",
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    encrypt: false,
  },
  port: 1433,
};

let isConnected = false;

const connectToDB = async () => {
  try {
    // Create a new connection pool
    const pool = await sql.connect(config);
    console.log("Connected to the database!");
    isConnected = true;
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    isConnected = false;
  }
};

const closeConnection = async (pool) => {
  if (isConnected && pool) {
    try {
      await pool.close();
      console.log("Connection closed.");
    } catch (error) {
      console.error("Failed to close the connection:", error);
    }
  }
};

module.exports = { config, connectToDB, closeConnection };
