import { config, connectToDB, closeConnection } from "@/utils/database";
const sql = require("mssql");

export const GET = async (req, { params }) => {
  const { CompID } = params;

  console.log("Comp ID received:", CompID); // Ensure the input is logged

  try {
    await connectToDB();
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .query(
        `select ColorID, Color from Category_col where CompanyID=${CompID}`
      );

    await closeConnection();
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (err) {
    console.error("Error fetching Colors:", err);
    return new Response("Failed to fetch Colors", { status: 500 });
  }
};
