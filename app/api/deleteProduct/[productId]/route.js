import { config, connectToDB, closeConnection } from "@/utils/database";
import fs from "fs";
import path from "path";
const sql = require("mssql");

export const DELETE = async (req, { params }) => {
  const { productId } = params;

  if (!productId) {
    return new Response(JSON.stringify({ message: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    await connectToDB();
    const pool = await sql.connect(config);

    // Fetch all image paths for the product to delete them from the file system
    const result = await pool.request().query(`
      SELECT ImagePath
      FROM ProductImages_det
      WHERE ProductID = ${productId}
    `);

    const imagePaths = result.recordset.map((row) => row.ImagePath);

    // Delete product images from the file system
    const imageDirectory = path.join(
      process.cwd(),
      "public/assets/ProductImages"
    );

    for (const imagePath of imagePaths) {
      const fullImagePath = path.join(imageDirectory, imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath); // Delete image file from the server
      }
    }

    // Delete from ProductImages_det (the images)
    await pool.request().query(`
      DELETE FROM ProductImages_det
      WHERE ProductID = ${productId}
    `);

    // Delete from ProductImages_mst (the product)
    await pool.request().query(`
      DELETE FROM ProductImages_mst
      WHERE ProductID = ${productId}
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
