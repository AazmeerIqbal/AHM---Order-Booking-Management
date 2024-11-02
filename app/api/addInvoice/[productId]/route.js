import { config, connectToDB, closeConnection } from "@/utils/database";
const sql = require("mssql");

export const POST = async (req, { params }) => {
  const { productId } = params; // Extract productId from the params (you may remove this since it's not needed for renaming now)
  console.log(productId);
  // Extract form data from request
  const formData = await req.formData();

  // Collect product fields from form data
  const CC = formData.get("CC");
  const productCode = parseInt(formData.get("productCode"), 10); // Convert to integer for ProductId
  const customer = parseInt(formData.get("customer"), 10); // Convert to integer for CustomerId
  const color = parseInt(formData.get("color"), 10); // Convert to integer for ColorId
  const rate = parseFloat(formData.get("rate")); // Convert to float for Rate
  const quantity = parseFloat(formData.get("quantity")); // Convert to float for Quantity
  const description = formData.get("description");
  const userId = formData.get("userId");

  // // Validate if required fields exist
  // if (
  //   !userId ||
  //   isNaN(productCode) ||
  //   isNaN(customer) ||
  //   isNaN(color) ||
  //   isNaN(rate) ||
  //   isNaN(quantity)
  // ) {
  //   return new Response(
  //     JSON.stringify({ message: "All fields are required" }),
  //     {
  //       status: 400,
  //     }
  //   );
  // }

  try {
    // Connect to the database
    await connectToDB();
    const pool = await sql.connect(config);

    // Insert new product order into the ProductOrder table
    await pool
      .request()
      .input("ProductId", sql.Int, productId) // ProductId as integer
      .input("CustomerId", sql.Int, customer) // CustomerId as integer
      .input("ColorId", sql.Int, color) // ColorId as integer
      .input("Rate", sql.Numeric(18, 2), rate) // Rate as numeric(18, 2)
      .input("Quantity", sql.Numeric(18, 2), quantity) // Quantity as numeric(18, 2)
      .input("Description", sql.VarChar(500), description) // Description as varchar(500)
      .query(`
        INSERT INTO ProductOrder (
          ProductId,
          CustomerId,
          ColorId,
          Rate,
          Quantity,
          Description
        ) VALUES (
          @ProductId,
          @CustomerId,
          @ColorId,
          @Rate,
          @Quantity,
          @Description
        )
      `);

    // Close DB connection
    await closeConnection();

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Invoice added successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error adding invoice:", err);
    return new Response(JSON.stringify({ message: "Failed to add invoice" }), {
      status: 500,
    });
  }
};
