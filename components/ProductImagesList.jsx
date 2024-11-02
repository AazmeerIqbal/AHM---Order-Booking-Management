"use client";
import React, { useState, useEffect } from "react";
import { MdFileUpload, MdDelete } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import LightBoxGallery from "./LightBoxGallery";
import Image from "next/image";

// Loader
import { SyncLoader } from "react-spinners";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Alert
import Swal from "sweetalert2";

const ProductImagesList = ({ data: initialData }) => {
  const [data, setData] = useState(initialData); // Local state for product data
  const [galleryImages, setGalleryImages] = useState([]); // State for gallery images
  const [ProductDetails, setProductDetails] = useState(null);
  const [openGallery, setOpenGallery] = useState(false); // Gallery modal state
  const [loader, setLoader] = useState(false); // Loading state

  // Update local data state when initialData prop changes
  useEffect(() => {
    setData(initialData); // Synchronize local state with new prop data
  }, [initialData]);

  // Handle View Gallery
  const handleViewGallery = async (product) => {
    console.log("product Id", product.ProductID);
    try {
      setLoader(true);
      const response = await fetch(
        `/api/getSpecificProductImage/${product.ProductID}`
      );

      // Parse the response as JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload images");
      }

      setProductDetails(product);
      setGalleryImages(data);
      setLoader(false);
      setOpenGallery(true);
    } catch (error) {
      console.error("Failed to get images:", error.message);
    }
  };

  // Handle Product Deletion
  const DeleteProduct = async (productId, ProductCode) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to delete Product Code: ${ProductCode}?`,
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
      const response = await fetch(`/api/deleteProduct/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to Delete Product");
      }

      // Filter out the deleted product from the state
      setData((prevData) =>
        prevData.filter((product) => product.ProductID !== productId)
      );

      // Show success message
      Swal.fire(
        "Deleted!",
        `Product ID: ${ProductCode} has been deleted.`,
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
                    <Image
                      src={`/assets/ProductImages/${product.ImagePath}`}
                      alt="Product"
                      className="mx-auto object-cover rounded-md"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </td>
                <td className="px-2 py-2 border-b border-gray-700">
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs md:text-sm lg:text-base rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 justify-center mx-auto"
                    onClick={() => handleViewGallery(product)}
                  >
                    <GrGallery />
                  </button>
                </td>
                <td className="px-2 py-2 border-b border-gray-700">
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs md:text-sm lg:text-base rounded-md hover:scale-105 transition duration-200 flex items-center gap-2 justify-center mx-auto"
                    onClick={() =>
                      DeleteProduct(product.ProductID, product.ProductCode)
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

      {openGallery && (
        <LightBoxGallery
          product={ProductDetails}
          handleViewGallery={handleViewGallery}
          openGallery={openGallery}
          setOpenGallery={setOpenGallery}
          images={galleryImages}
        />
      )}
      <ToastContainer />
      {loader && (
        <SyncLoader
          className="fixed z-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          color="#ffffff"
        />
      )}
    </div>
  );
};

export default ProductImagesList;
