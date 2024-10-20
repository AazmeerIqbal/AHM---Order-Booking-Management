"use client";
import React, { useState } from "react";
import { MdFileUpload } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import LightBoxGallery from "./LightBoxGallery";

//Loader
import { SyncLoader } from "react-spinners";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Alert
import Swal from "sweetalert2";

const ProductImagesList = ({ data }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [openGallery, setOpenGallery] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleViewGallery = async (productId) => {
    console.log("product Id", productId);
    try {
      setLoader(true);
      const response = await fetch(`/api/getSpecificProductImage/${productId}`);

      // Parse the response as JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload images");
      }

      setGalleryImages(data);
      setLoader(false);
      setOpenGallery(true);
      // console.log(data.message); // "Images uploaded and details inserted successfully"
    } catch (error) {
      console.error("Failed to get images:", error.message);
    }
  };

  const DeleteProduct = async (productId) => {
    try {
      // Use SweetAlert2 to show a confirmation dialog
      const result = await Swal.fire({
        title: `Are you sure you want to delete Product Code: ${productId}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel",
      });

      // If the user cancels, stop the function
      if (!result.isConfirmed) {
        return;
      }

      // Proceed with deletion if confirmed
      setLoader(true);
      const response = await fetch(`/api/deleteProduct/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to Delete Product");
      }

      // Show success message
      Swal.fire(
        "Deleted!",
        `Product ID: ${productId} has been deleted.`,
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
    <div className="overflow-x-auto mt-16">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-left text-white">
          <thead>
            <tr className="bg-gray-800 text-center">
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Product Code
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Product Category
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Fabric
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Weight
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Composition
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Color
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                Image
              </th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700"></th>
              <th className="px-2 py-2 text-sm md:text-base border-b border-gray-700"></th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-center">
            {data.map((product) => (
              <tr
                key={product.ProductID}
                className="hover:bg-gray-800 transition duration-150"
              >
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.ProductCode}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.Category}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.Fabric}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.FabricWeight}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.Composition}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.Color}
                </td>
                <td className="px-2 py-2 text-sm md:text-base border-b border-gray-700">
                  {product.ImagePath ? (
                    <img
                      src={`assets/ProductImages/${product.ImagePath}`}
                      alt="Product"
                      className="w-20 h-20 mx-auto object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </td>
                <td className="px-2 py-2 border-b border-gray-700">
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs md:text-sm lg:text-base rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 justify-center mx-auto"
                    onClick={() => handleViewGallery(product.ProductID)}
                  >
                    <GrGallery />
                  </button>
                </td>
                <td className="px-2 py-2 border-b border-gray-700">
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs md:text-sm lg:text-base rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 justify-center mx-auto"
                    onClick={() => DeleteProduct(product.ProductID)}
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openGallery == true ? (
        <LightBoxGallery
          handleViewGallery={handleViewGallery}
          openGallery={openGallery}
          setOpenGallery={setOpenGallery}
          images={galleryImages}
        />
      ) : null}
      <ToastContainer />
      {loader === true ? (
        <SyncLoader
          className="fixed z-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          color="#ffffff"
        />
      ) : null}
    </div>
  );
};

export default ProductImagesList;
