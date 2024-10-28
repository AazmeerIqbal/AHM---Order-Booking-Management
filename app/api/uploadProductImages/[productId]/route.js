import { config, connectToDB, closeConnection } from "@/utils/database";
import fs from "fs";
import path from "path";
const sql = require("mssql");

export const POST = async (req, { params }) => {
  const { productId } = params;
  console.log("productId:", productId);

  if (!productId) {
    return new Response(JSON.stringify({ message: "Product ID is required" }), {
      status: 400,
    });
  }

  const formData = await req.formData();
  const images = formData.getAll("images");

  if (images.length === 0) {
    return new Response(JSON.stringify({ message: "No images provided" }), {
      status: 400,
    });
  }

  try {
    await connectToDB();
    const pool = await sql.connect(config);

    const imageDirectory = path.join(
      process.cwd(),
      "public/assets/ProductImages"
    );
    if (!fs.existsSync(imageDirectory)) {
      fs.mkdirSync(imageDirectory, { recursive: true });
    }

    for (let image of images) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const imageExt = path.extname(image.name);
      const newFileName = `${productId}-${randomNum}${imageExt}`;

      const imageBuffer = await image.arrayBuffer();
      const imagePath = path.join(imageDirectory, newFileName);
      fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

      await pool.request().query(`
        INSERT INTO ProductImages_det (ProductID, ImagePath)
        VALUES (${productId}, '${newFileName}')
      `);
    }

    await closeConnection();

    return new Response(
      JSON.stringify({
        message: "Images uploaded and details inserted successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error uploading images:", err);
    return new Response(
      JSON.stringify({ message: "Failed to upload images" }),
      { status: 500 }
    );
  }
};
