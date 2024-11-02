"use client";
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Loader
import { SyncLoader } from "react-spinners";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// MUI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { MdDelete } from "react-icons/md";

// Alert
import Swal from "sweetalert2";

const AddInquiry = ({ setAddInquiryPopUp }) => {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState([]);
  const [loader, setLoader] = useState(false);
  const [productImage, setProductImage] = useState([]);
  const [data, setData] = useState([]); // Local state for product data
  const [saveStatus, setSaveStatus] = useState(false);

  const [productDetails, setProductDetails] = useState({
    CC: session?.user?.companyId,
    userId: session?.user?.id,
    productCode: "",
    customer: "",
    color: "",
    rate: "",
    quantity: "",
    description: "",
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    console.log(productDetails);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoader(true);
        const response = await fetch(`/api/getProductCodes/${inputValue}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
        setLoader(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    if (inputValue.length > 0) {
      fetchItems();
    }
  }, [inputValue]);

  const [Customer, setCustomer] = useState([]);
  const [Colors, setColors] = useState([]);

  // Fetch Product Customers and Colors based on Company ID
  useEffect(() => {
    const CompID = session?.user?.companyId;
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`/api/getCustomersList/${CompID}`);
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to get Categories");
        setCustomer(data);
      } catch (err) {
        console.log("Failed to get Categories", err);
      }
    };
    const fetchColorsCategory = async () => {
      try {
        const response = await fetch(`/api/getColorsCategory/${CompID}`);
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to get Colors");
        setColors(data);
      } catch (err) {
        console.log("Failed to get Colors", err);
      }
    };
    fetchCustomers();
    fetchColorsCategory();
  }, [session?.user?.companyId]);

  //Save Invoice
  const handleSave = async (productImage) => {
    console.log(productImage);
    // Validate if all fields are filled
    const {
      CC,
      userId,
      productCode,
      customer,
      color,
      rate,
      quantity,
      description,
    } = productDetails;
    if (
      !CC ||
      !userId ||
      !productCode ||
      !customer ||
      !color ||
      !rate ||
      !quantity
    ) {
      toast.error("Please fill out all fields", { position: "top-center" });
      return;
    }

    setSaveStatus(true);
    const formData = new FormData();
    formData.append("CC", CC);
    formData.append("userId", userId);
    formData.append("productCode", productCode);
    formData.append("customer", customer);
    formData.append("color", color);
    formData.append("rate", rate);
    formData.append("quantity", quantity);
    formData.append("description", description);

    try {
      console.log("CC:", CC);
      const response = await fetch(
        `/api/addInvoice/${productImage[0].ProductID}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
        setSaveStatus(false);
      }

      // Show success toast
      toast.success("Invoice Added Successfully", {
        position: "top-center",
      });

      // Reset product details and gallery images
      setProductDetails({
        CC: session?.user?.companyId,
        userId: session?.user?.id,
        productCode: "",
        customer: "",
        color: "",
        rate: "",
        quantity: "",
        description: "",
      });
      setProductImage([]);
      setSaveStatus(false);

      console.log("Product saved successfully!");
    } catch (error) {
      console.error("Failed to save product:", error.message);
    }
  };

  // Fetch Product Image on product selection
  const handleProductSelect = async (product) => {
    try {
      const response = await fetch(
        `/api/getSpecificProductImage/${product.ProductID}`
      );
      if (!response.ok) throw new Error("Failed to fetch product image");
      const imageData = await response.json();
      setProductImage(imageData);
      // setData(imageData);
      console.log(productImage);
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        productCode: product.ProductCode,
      }));
    } catch (error) {
      console.error("Failed to fetch product image:", error);
    }

    try {
      const response = await fetch(
        `/api/getInvoiceProductDetails/${product.ProductID}`
      );
      if (!response.ok) throw new Error("Failed to fetch product image");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    }
  };

  // Handle Product Deletion
  const DeleteProduct = async (OrderId, ProductCode) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to delete Invoice with Product Code: ${ProductCode}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      setLoader(true);
      const response = await fetch(`/api/deleteInvoice/${OrderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to Delete Invoice");
      }

      // Filter out the deleted product from the state
      setData((prevData) =>
        prevData.filter((product) => product.OrderId !== OrderId)
      );

      // Show success message
      Swal.fire(
        "Deleted!",
        `Invoice with Product Code: ${ProductCode} has been deleted.`,
        "success"
      );
    } catch (error) {
      console.error("Failed to delete product:", error.message);
      Swal.fire("Error!", error.message, "error");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="relative w-[95%] h-[95vh] bg-[#0A0A0A] text-white rounded-lg shadow-lg p-6 overflow-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
          <div className="flex justify-between items-center pb-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Add Inquiry</h2>
            <button
              onClick={() => setAddInquiryPopUp(false)}
              className="text-gray-300 hover:text-white transition duration-200"
            >
              <IoMdClose size={34} />
            </button>
          </div>

          <div className="flex justify-between items-start mt-4">
            {/* Left Panel */}
            <div className="w-[48%] space-y-4">
              {/* Autocomplete for Product Code */}
              <div className="w-full">
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={items}
                  getOptionLabel={(option) => option.ProductCode}
                  isOptionEqualToValue={(option, value) =>
                    option.ProductCode === value.ProductCode
                  }
                  onInputChange={(event, newInputValue) =>
                    setInputValue(newInputValue)
                  }
                  onChange={(event, value) =>
                    value && handleProductSelect(value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      backgroundColor: "#1a1a1a",
                      borderRadius: "8px",
                      padding: {
                        xs: "8px",
                        sm: "12px",
                      },
                      "& fieldset": { borderColor: "#3b3b3b" },
                      "&:hover fieldset": { borderColor: "#5b5b5b" },
                      "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#9e9e9e",
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                        md: "1rem",
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Product Code"
                      InputLabelProps={{ style: { color: "#9e9e9e" } }}
                      fullWidth
                    />
                  )}
                />
              </div>

              {/* Customer Name */}
              <select
                name="customer"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.customer}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select Customer
                </option>
                {Customer.map((cus) => (
                  <option key={cus.CustomerID} value={cus.CustomerID}>
                    {cus.CUstomerName}
                  </option>
                ))}
              </select>

              {/* Color */}
              <select
                name="color"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.color}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select Color
                </option>
                {Colors.map((col) => (
                  <option key={col.ColorID} value={col.ColorID}>
                    {col.Color}
                  </option>
                ))}
              </select>

              {/* Rate */}
              <input
                type="text"
                name="rate"
                placeholder="Rate"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.rate}
                onChange={handleInputChange}
              />

              {/* Quantity */}
              <input
                type="text"
                name="quantity"
                placeholder="Quantity"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.quantity}
                onChange={handleInputChange}
              />

              {/* Description */}
              <textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.description}
                onChange={handleInputChange}
              />
              {/* Save Button */}
              <div className="flex justify-start mt-4">
                <button
                  onClick={() => handleSave(productImage)}
                  className="px-6 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition"
                >
                  {saveStatus == true ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-[48%]">
              {/* Popup Content */}
              <div className="mt-6 h-[75vh] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
                {productImage.slice(0, 1).map((image, index) => (
                  <div
                    key={index}
                    className="w-full md:h-48 lg:h-56 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={`/assets/ProductImages/${image.ImagePath}`}
                      alt={`Product ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      // onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {productImage.length > 0 ? (
            <div className="mt-2">
              <h1 className="text-start font-bold text-2xl mb-2">
                Invoice List for Prodect Code:
                <b> {productImage[0].ProductCode}</b>
              </h1>
              <table className="min-w-full table-auto text-left text-white">
                <thead>
                  <tr className="bg-gray-800 text-center">
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Product Code
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Customer
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Color
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Quantity
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                      Description
                    </th>
                    <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 text-center">
                  {data.map((product) => (
                    <tr
                      key={product.OrderId}
                      className="hover:bg-gray-800 transition duration-150"
                    >
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.ProductCode}
                      </td>
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.CustomerName}
                      </td>
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.Color}
                      </td>
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.Rate}
                      </td>
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.Quantity}
                      </td>
                      <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                        {product.Description}
                      </td>
                      <td className="px-2 py-2 border-b border-gray-700">
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs md:text-sm lg:text-base rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 justify-center mx-auto"
                          onClick={() =>
                            DeleteProduct(product.OrderId, product.ProductCode)
                          }
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
      <ToastContainer />
      {loader == true ? (
        <SyncLoader className="z-[900] mb-5" color="#ffffff" />
      ) : null}
    </>
  );
};

export default AddInquiry;
