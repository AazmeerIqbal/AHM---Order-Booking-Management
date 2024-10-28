import { config, connectToDB, closeConnection } from "@/utils/database";
const sql = require("mssql");

export const POST = async (req, { params }) => {
  const { productId } = params; // Extract productId from the params
  console.log("Product Id:", productId);

  // Validate if the productId exists
  if (!productId) {
    return new Response(JSON.stringify({ message: "Product ID is required" }), {
      status: 400,
    });
  }

  // Extract form data
  const formData = await req.formData();

  // Collect product fields from form data
  const CC = formData.get("CC");
  const productCode = formData.get("productCode");
  const categoryId = formData.get("category"); // Dropdown CategoryId
  const fabric = formData.get("fabric");
  const fabricWeight = formData.get("fabricWeight");
  const composition = formData.get("composition");
  const color = formData.get("color");
  const description = formData.get("description");
  const userId = formData.get("userId"); // Assuming you have a UserId field
  const updatedOn = new Date().toISOString(); // Current date for update

  // Validate if required fields exist
  if (!userId || !productCode || !categoryId) {
    return new Response(
      JSON.stringify({ message: "All fields are required" }),
      {
        status: 400,
      }
    );
  }

  try {
    // Connect to the database
    await connectToDB();
    const pool = await sql.connect(config);

    // Update product details in the ProductImages_mst table
    await pool
      .request()
      .input("ProductId", sql.Int, productId)
      .input("CC", sql.Int, CC)
      .input("ProductCode", sql.VarChar, productCode)
      .input("CategoryId", sql.Int, categoryId)
      .input("UserId", sql.Int, userId)
      .input("Fabric", sql.VarChar, fabric)
      .input("FabricWeight", sql.VarChar, fabricWeight)
      .input("Composition", sql.VarChar, composition)
      .input("Color", sql.VarChar, color)
      .input("Description", sql.VarChar, description)
      .input("UpdatedOn", sql.DateTime, updatedOn).query(`
        UPDATE ProductImages_mst
        SET 
          CC = @CC,
          ProductCode = @ProductCode,
          CategoryId = @CategoryId,
          UserId = @UserId,
          Fabric = @Fabric,
          FabricWeight = @FabricWeight,
          Composition = @Composition,
          ColorId = @Color,
          Description = @Description,
          UploadOn = @UpdatedOn
        WHERE ProductId = @ProductId
      `);

    // Close DB connection
    await closeConnection();

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Product updated successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating product:", err);
    return new Response(
      JSON.stringify({ message: "Failed to update product" }),
      {
        status: 500,
      }
    );
  }
};
