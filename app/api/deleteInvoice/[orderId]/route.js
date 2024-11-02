import { config, connectToDB, closeConnection } from "@/utils/database";
import fs from "fs";
import path from "path";
const sql = require("mssql");

export const DELETE = async (req, { params }) => {
  const { orderId } = params;

  if (!orderId) {
    return new Response(JSON.stringify({ message: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    await connectToDB();
    const pool = await sql.connect(config);

    // Delete from ProductImages_det (the images)
    await pool.request().query(`
      DELETE FROM ProductOrder
      WHERE OrderId = ${orderId}
    `);

    await closeConnection();

    return new Response(
      JSON.stringify({
        message: "Product and associated images deleted successfully",
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error deleting product:", err);
    return new Response(
      JSON.stringify({ message: "Failed to delete product" }),
      {
        status: 500,
      }
    );
  }
};
