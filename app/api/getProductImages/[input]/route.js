import { config, connectToDB, closeConnection } from "@/utils/database";
const sql = require("mssql");

export const GET = async (req, { params }) => {
  const { input } = params;

  // const input = url.searchParams.get("input");
  console.log("input received:", input); // Ensure the input is logged

  // if (!input || input.length < 3) {
  //   return new Response("input must be at least 3 characters long", {
  //     status: 400,
  //   });
  // }

  try {
    await connectToDB();
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("SearchTerm", sql.VarChar(100), input + "%") // Added '%' to match like input
      .execute("GetTop25ProductCodes");

    await closeConnection();
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (err) {
    console.error("Error fetching items:", err);
    return new Response("Failed to fetch products", { status: 500 });
  }
};
