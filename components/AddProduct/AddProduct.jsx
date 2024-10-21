"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { IoMdClose } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";

//Loader
import { SyncLoader } from "react-spinners";

// Lightbox Gallery
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProduct = ({ setAddProductPopUp }) => {
  const { data: session } = useSession();
  const [loader, setLoader] = useState(false);
  const [index, setIndex] = useState(-1);
  const [galleryImages, setGalleryImages] = useState([]); // For image previews
  const [productDetails, setProductDetails] = useState({
    CC: session?.user?.companyId,
    userId: session?.user?.id,
    productCode: "",
    category: "",
    fabric: "",
    fabricWeight: "",
    composition: "",
    color: "",
    description: "",
  });

  const [Category, setCategory] = useState([]);
  const [Colors, setColors] = useState([]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    console.log(productDetails);
  };

  // Handle image selection (preview only for now)
  const handleImageSelection = (event) => {
    const files = event.target.files;
    const selectedImages = [];
    for (let i = 0; i < files.length; i++) {
      selectedImages.push({
        file: files[i],
        preview: URL.createObjectURL(files[i]), // Preview URL
      });
    }
    setGalleryImages(selectedImages); // Set images for preview
  };

  // Get Product Category
  useEffect(() => {
    const CompID = session?.user?.companyId;
    console.log(session?.user);
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

  // Save button will handle the API call (details and images)
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

    galleryImages.forEach((image, index) => {
      formData.append("images", image.file); // Append selected image files
    });

    try {
      const response = await fetch(
        `/api/saveProduct/${productDetails.productCode}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      // Show success toast
      toast.success("Product Added Successfully", {
        position: "top-center",
      });

      // Reset product details and gallery images
      setProductDetails({
        CC: session?.user?.companyId,
        userId: session?.user?.id,
        productCode: "",
        category: "",
        fabric: "",
        fabricWeight: "",
        composition: "",
        color: "",
        description: "",
      });
      setGalleryImages([]);
      setLoader(true);

      console.log("Product saved successfully!");
    } catch (error) {
      console.error("Failed to save product:", error.message);
    }
  };

  return (
    <>
      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={galleryImages.map((image) => ({
          src: image.preview,
        }))}
        plugins={[Download, Fullscreen, Zoom, Thumbnails]}
      />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {/* Popup content */}
        <div className="relative w-[95%] h-[95vh] bg-[#0A0A0A] text-white rounded-lg shadow-lg p-6 overflow-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
          {/* Navbar */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Add Product</h2>
            <div className="flex items-center space-x-4 ">
              <input
                type="file"
                accept="image/*"
                multiple
                id="image-upload"
                style={{ display: "none" }}
                onChange={handleImageSelection}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#2C60EB] to-[#9034EA] text-white rounded-md hover:scale-105 transition duration-200 flex items-center gap-2"
              >
                <span>Upload Images</span>
                <MdFileUpload />
              </label>
              <button
                onClick={() => setAddProductPopUp(false)}
                className="text-gray-300 hover:text-white transition duration-200"
              >
                <IoMdClose size={34} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start mt-4">
            {/* Left side: Text input fields */}
            <div className="w-[48%] space-y-4">
              <input
                type="text"
                name="productCode"
                placeholder="Product Code"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.productCode}
                onChange={handleInputChange}
              />
              <select
                name="category"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.category}
                onChange={handleInputChange}
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

              <input
                type="text"
                name="fabric"
                placeholder="Fabric"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.fabric}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="fabricWeight"
                placeholder="Fabric Weight"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.fabricWeight}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="composition"
                placeholder="Composition"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.composition}
                onChange={handleInputChange}
              />
              {/* <input
                type="text"
                name="color"
                placeholder="Color"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.color}
                onChange={handleInputChange}
              /> */}
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
              <textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 rounded-md bg-gray-800 text-white"
                value={productDetails.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Right side: Image upload and preview */}
            <div className="w-[48%]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-[60vh] scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="w-full h-48 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <img
                      src={image.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
      {loader == true ? <SyncLoader className="mt-4" color="#ffffff" /> : null}
    </>
  );
};

export default AddProduct;
