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
        `select CategoryId, Category from Category_mst where CompanyID=${CompID}`
      );

    await closeConnection();
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (err) {
    console.error("Error fetching items:", err);
    return new Response("Failed to fetch products", { status: 500 });
  }
};
