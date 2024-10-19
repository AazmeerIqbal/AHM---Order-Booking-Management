"use client";

import * as React from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";

//Light Box
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Download from "yet-another-react-lightbox/plugins/download";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const LightBoxGallery = ({
  handleViewGallery,
  openGallery,
  setOpenGallery,
  images,
}) => {
  console.log(images);
  const [index, setIndex] = useState(-1);

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
        <div className="relative w-[95%] h-[95vh] bg-[#0A0A0A] text-white rounded-lg shadow-lg p-6 overflow-hidden">
          {/* Navbar */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-700">
            {/* Left Side: Product Code */}
            <h2 className="text-lg font-semibold text-white">
              Product Code: {images[0].ProductID}
            </h2>

            {/* Right Side: Buttons */}
            <div className="flex items-center space-x-4">
              {/* Upload Image */}
              <input
                type="file"
                accept="image/*" // Only allow image files
                multiple // Allow multiple files
                id={`upload-${images[0].ProductID}`} // Unique ID for each input
                style={{ display: "none" }}
                onChange={(event) =>
                  handleImageUpload(event, images[0].ProductID)
                } // Send product code
              />

              {/* Label to trigger file input */}
              <label
                htmlFor={`upload-${images[0].ProductID}`}
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
            <div className="w-[48%]">Content</div>
            <div className="w-[48%]">
              {/* Popup Content */}
              <div className="mt-6 h-[75vh] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2C60EB] scrollbar-track-[#0A0A0A]">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="w-full md:h-48 lg:h-56 rounded-lg overflow-hidden cursor-pointer"
                  >
                    <img
                      src={`assets/ProductImages/${image.ImagePath}`}
                      alt={`Product ${index + 1}`}
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
    </>
  );
};

export default LightBoxGallery;
