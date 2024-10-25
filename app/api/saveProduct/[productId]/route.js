import { config, connectToDB, closeConnection } from "@/utils/database";
import fs from "fs";
import path from "path";
const sql = require("mssql");

export const POST = async (req, { params }) => {
  const { productId } = params; // Extract productId from the params (you may remove this since it's not needed for renaming now)

  // Validate if the productId exists
  if (!productId) {
    return new Response(JSON.stringify({ message: "Product ID is required" }), {
      status: 400,
    });
  }

  // Extract form data
  const formData = await req.formData();
  const images = formData.getAll("images");

  console.log("CC:", formData.get("CC"));

  // Collect other product fields from form data
  const CC = formData.get("CC");
  const productCode = formData.get("productCode");
  const categoryId = formData.get("category"); // Dropdown CategoryId
  const fabric = formData.get("fabric");
  const fabricWeight = formData.get("fabricWeight");
  const composition = formData.get("composition");
  const color = formData.get("color");
  const description = formData.get("description");
  const userId = formData.get("userId"); // Assuming you have a UserId field
  const uploadOn = new Date().toISOString(); // Current date

  console.log(userId, productCode, categoryId);

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

    // Insert product details into the ProductImages_mst table and get the auto-generated ProductId
    const result = await pool
      .request()
      .input("CC", sql.Int, CC)
      .input("ProductCode", sql.VarChar, productCode)
      .input("CategoryId", sql.Int, categoryId)
      .input("UserId", sql.Int, userId)
      .input("Fabric", sql.VarChar, fabric)
      .input("FabricWeight", sql.VarChar, fabricWeight)
      .input("Composition", sql.VarChar, composition)
      .input("Color", sql.VarChar, color)
      .input("Description", sql.VarChar, description)
      .input("UploadOn", sql.DateTime, uploadOn).query(`
        INSERT INTO ProductImages_mst 
        (CC, ProductCode, UploadOn, CategoryId, UserId, Fabric, FabricWeight, Composition, ColorId, Description)
        OUTPUT inserted.ProductId
        VALUES (@CC, @ProductCode, @UploadOn, @CategoryId, @UserId, @Fabric, @FabricWeight, @Composition, @Color, @Description)
      `);

    const insertedProductId = result.recordset[0].ProductId; // Get the auto-generated ProductId

    // Handle Image Uploads
    const imageDirectory = path.join(
      process.cwd(),
      "public/assets/ProductImages"
    );
    if (!fs.existsSync(imageDirectory)) {
      fs.mkdirSync(imageDirectory, { recursive: true });
    }

    const savedImages = [];
    for (let image of images) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      const imageExt = path.extname(image.name); // Get the extension
      const newFileName = `${insertedProductId}-${randomNum}${imageExt}`; // Rename using insertedProductId

      const imageBuffer = await image.arrayBuffer(); // Get image buffer
      const imagePath = path.join(imageDirectory, newFileName); // File path for saving
      fs.writeFileSync(imagePath, Buffer.from(imageBuffer)); // Save image

      savedImages.push(newFileName); // Collect the saved file name
    }

    // Insert images into ProductImages_det
    for (let imageName of savedImages) {
      await pool.request().query(`
          INSERT INTO ProductImages_det (ProductID, ImagePath)
          VALUES (${insertedProductId}, '${imageName}')
        `);
    }

    // Close DB connection
    await closeConnection();

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Product saved and images uploaded successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error saving product:", err);
    return new Response(JSON.stringify({ message: "Failed to save product" }), {
      status: 500,
    });
  }
};
