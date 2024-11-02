"use client";

import * as React from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";
import { useSession } from "next-auth/react";
import Image from "next/image";

//Loader
import { SyncLoader } from "react-spinners";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//Light Box
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useEffect } from "react";

const LightBoxGallery = ({
  product,
  handleViewGallery,
  openGallery,
  setOpenGallery,
  images,
}) => {
  console.log(images);

  const { data: session } = useSession();
  const [loader, setLoader] = useState(false);

  const [index, setIndex] = useState(-1);
  const [productDetails, setProductDetails] = useState({
    CC: session?.user?.companyId,
    userId: session?.user?.id,
    productCode: product.ProductCode,
    category: product.CategoryId,
    fabric: product.Fabric,
    fabricWeight: product.FabricWeight,
    composition: product.Composition,
    color: product.ColorId,
    description: product.Description,
  });

  const [originalDetails, setOriginalDetails] = useState({});

  useEffect(() => {
    setOriginalDetails(productDetails); // Store original product details
  }, []);

  const [EditEnabled, setEditEnabled] = useState(false);

  // Update Product
  const handleSave = async () => {
    setLoader(true);
    const formData = new FormData();
    formData.append("CC", productDetails.CC);
    formData.append("userId", productDetails.userId);
    formData.append("productCode", productDetails.productCode);
    formData.append("category", productDetails.category);
    formData.append("fabric", productDetails.fabric);
    formData.append("fabricWeight", productDetails.fabricWeight);
    formData.append("composition", productDetails.composition);
    formData.append("color", productDetails.color);
    formData.append("description", productDetails.description);

    try {
      // console.log("CC:", productDetails.CC);
      const response = await fetch(`/api/updateProduct/${product.ProductID}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
        setLoader(false);
      }

      // Show success toast
      toast.success("Product Updated Successfully", {
        position: "top-center",
      });

      // Reset product details and gallery images
      setOriginalDetails(productDetails);
      setLoader(false);
      setEditEnabled(false);

      console.log("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error.message);
    }
  };

  const handleCancel = () => {
    setProductDetails(originalDetails); // Reset to original data
    setEditEnabled(false); // Disable editing
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    // console.log(productDetails);
  };

  const handleImageClick = (index) => {
    setIndex(index);
  };

  const handleImageUpload = async (event, productId) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const response = await fetch(`/api/uploadProductImages/${productId}`, {
        method: "POST",
        body: formData,
      });

      // Parse the response as JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload images");
      }
      handleViewGallery(productId);
      toast.success("Uploaded Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to upload images:", error.message);
    }
  };

  const [Category, setCategory] = useState([]);
  const [Colors, setColors] = useState([]);

  // Get Product Category and Color Category
  useEffect(() => {
    const CompID = session?.user?.companyId;
    // console.log(session?.user);
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/getProductCategory/${CompID}`, {
          method: "GET",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to get Categories");
        }
        setCategory(data);
        // Handle success (e.g., show a success message, reset form, etc.)
        // console.log("Category: ", Category);
      } catch (err) {
        console.log("Failed to get Categories", err);
      }
    };
    const fetchColorsCategory = async () => {
      try {
        const response = await fetch(`/api/getColorsCategory/${CompID}`, {
          method: "GET",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to get Categories");
        }
        setColors(data);
        // Handle success (e.g., show a success message, reset form, etc.)
        // console.log("Category: ", Category);
      } catch (err) {
        console.log("Failed to get Categories", err);
      }
    };
    fetchCategories();
    fetchColorsCategory();
  }, [session?.user?.companyId]);

  return (
    <>
      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={images.map((image) => ({
          src: `assets/ProductImages/${image.ImagePath}`,
        }))}
        plugins={[Download, Fullscreen, Zoom, Thumbnails]}
      />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {/* Popup content */}
        <div className="relative w-[95%] h-[95vh] bg-[#0A0A0A] text-white rounded-lg shadow-lg p-6 overflow-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
          {/* Navbar */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-700">
            {/* Left Side: Product Code */}
            <h2 className="text-lg font-semibold text-white">
              Product Code: {productDetails.productCode}
            </h2>

            {/* Right Side: Buttons */}
            <div className="flex items-center space-x-4">
              {/* Upload Image */}
              <input
                type="file"
                accept="image/*" // Only allow image files
                multiple // Allow multiple files
                id={`upload-${product.ProductID}`} // Unique ID for each input
                style={{ display: "none" }}
                onChange={(event) =>
                  handleImageUpload(event, product.ProductID)
                } // Send product code
              />

              {/* Label to trigger file input */}
              <label
                htmlFor={`upload-${product.ProductID}`}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#2C60EB] to-[#9034EA] text-white rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 w-full justify-center"
              >
                <span>Upload Image</span>
                <MdFileUpload />
              </label>

              {/* Cancel Button */}
              <button
                onClick={() => setOpenGallery(false)}
                className="text-gray-300 hover:text-white transition duration-200"
              >
                <IoMdClose size={34} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            {/* Left Panel */}
            <div className="w-[48%] ">
              <p className="text-gray-400 font-bold text-left mt-1">
                Product Code:
              </p>
              <input
                type="text"
                name="productCode"
                placeholder="Product Code"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.productCode}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              />

              <p className="text-gray-400 font-bold text-left mt-1">
                Category:
              </p>
              <select
                name="category"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.category}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {Category.map((cat) => (
                  <option key={cat.CategoryId} value={cat.CategoryId}>
                    {cat.Category}
                  </option>
                ))}
              </select>

              <p className="text-gray-400 font-bold text-left mt-1">Fabric:</p>
              <input
                type="text"
                name="fabric"
                placeholder="Fabric"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.fabric}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              />

              <p className="text-gray-400 font-bold text-left mt-1">
                Fabric Weight:
              </p>
              <input
                type="text"
                name="fabricWeight"
                placeholder="Fabric Weight"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.fabricWeight}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              />

              <p className="text-gray-400 font-bold text-left mt-1">
                Composition:
              </p>
              <input
                type="text"
                name="composition"
                placeholder="Composition"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.composition}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              />

              <p className="text-gray-400 font-bold text-left mt-1">Color:</p>
              <select
                name="color"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.color}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
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

              <p className="text-gray-400 font-bold text-left mt-1">
                Description:
              </p>
              <textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.description}
                onChange={handleInputChange}
                disabled={EditEnabled == true ? false : true}
              />
              <div className="flex gap-4">
                {EditEnabled == false ? (
                  <button
                    className="cursor-pointer px-4 py-2 bg-[#2C60EB] text-white rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 w-[80px] justify-center mt-3"
                    onClick={() => setEditEnabled(true)}
                  >
                    Edit
                  </button>
                ) : null}

                {EditEnabled == true ? (
                  <button
                    className="cursor-pointer px-4 py-2 bg-[#2C60EB] text-white rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 w-[80px] justify-center mt-3"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                ) : null}

                {EditEnabled == true ? (
                  <button
                    className="cursor-pointer px-4 py-2 bg-[#eb552c] text-white rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 w-[80px] justify-center mt-3"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-[48%]">
              {/* Popup Content */}
              <div className="mt-6 h-[75vh] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
                {images.map((image, index) => (
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
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      {loader == true ? (
        <SyncLoader className="z-[900] mb-5" color="#ffffff" />
      ) : null}
    </>
  );
};

export default LightBoxGallery;
