"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";
import { IoIosArrowForward, IoIosAddCircle } from "react-icons/io";
import ProductImagesList from "@/components/ProductImagesList";
import AddProduct from "@/components/AddProduct/AddProduct";
import { useRouter } from "next/navigation";

//Loader
import { SyncLoader } from "react-spinners";

// MUI
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  // console.log(session?.user);
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [AddProductPopUp, setAddProductPopUp] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoader(true);
        const response = await fetch(`/api/getProductImages/${inputValue}`);
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
    console.log(items);

    // if (inputValue.length == 0) {
    //   setItems([]);
    // }
  }, [inputValue]);

  const handleLogOut = async () => {
    await signOut({ redirect: false }); // Sign out without auto-redirecting
    router.push("/login");
  };

  return (
    <>
      <section className="h-full w-full pt-36 relative flex items-center justify-center flex-col">
        {/* grid */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] mask-image-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <p className="text-center text-white">
            Run your agency, in one place
          </p>
          <h1 className="text-5xl font-bold text-center md:text-[100px] text-white">
            Order Booking{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Management
            </span>
          </h1>
        </div>
        <div className="absolute top-3 right-4 flex  items-center gap-4">
          {/* <span className="text-md md:text-lg">Hi, {session?.user?.name}</span> */}
          <div
            className="text-xs md:text-sm p-2 border border-gray-400 rounded-md  cursor-pointer hover:bg-gray-100 hover:text-black transition"
            onClick={() => handleLogOut()}
          >
            <LuLogOut />
          </div>
        </div>
      </section>

      <div className="p-12 ">
        <div className="text-white text-center">
          {/* button */}
          <div className="flex items-center justify-center space-x-4 gap-1 gap-y-4 flex-wrap">
            {/* Search Product */}
            <div className="relative group">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={items}
                getOptionLabel={(option) => option.ProductCode}
                isOptionEqualToValue={(option, value) =>
                  option.ProductCode === value.ProductCode
                } //
                onInputChange={(event, newInputValue) =>
                  setInputValue(newInputValue)
                }
                sx={{
                  width: {
                    xs: 300, // Width for small screens (mobile)
                    sm: 300, // Width for medium screens (tablets and above)
                    md: 400, // Width for larger screens
                  },
                  "& .MuiOutlinedInput-root": {
                    color: "white", // Text color
                    backgroundColor: "#1a1a1a", // Input background
                    borderRadius: "8px",
                    padding: {
                      xs: "8px", // Padding for small screens
                      sm: "12px", // Padding for medium screens
                    },
                    "& fieldset": {
                      borderColor: "#3b3b3b", // Border color
                    },
                    "&:hover fieldset": {
                      borderColor: "#5b5b5b", // Border color on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00bcd4", // Border color when focused
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#9e9e9e", // Label color
                    fontSize: {
                      xs: "0.75rem", // Smaller label font for mobile
                      sm: "0.875rem", // Slightly larger for medium screens
                      md: "1rem", // Default font size for larger screens
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#00bcd4", // Label color when focused
                  },
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "white", // Color of the dropdown arrow
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "#9e9e9e", // Clear button color
                  },
                  "& .MuiAutocomplete-option": {
                    backgroundColor: "#1a1a1a", // Options dropdown background
                    color: "white", // Option text color
                    fontSize: {
                      xs: "0.75rem", // Smaller option text for mobile
                      sm: "0.875rem", // Slightly larger for medium screens
                      md: "1rem", // Default for larger screens
                    },
                    "&[aria-selected='true']": {
                      backgroundColor: "#333333", // Selected option background
                    },
                    "&:hover": {
                      backgroundColor: "#444444", // Option background on hover
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Product Code"
                    InputLabelProps={{
                      style: { color: "#9e9e9e" }, // Label color
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white", // Input text color
                        backgroundColor: "#1a1a1a", // Input background color
                        "& fieldset": {
                          borderColor: "#3b3b3b", // Border color
                        },
                        "&:hover fieldset": {
                          borderColor: "#5b5b5b", // Border color on hover
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#00bcd4", // Border color when focused
                        },
                        padding: {
                          xs: "8px", // Smaller padding for mobile
                          sm: "12px", // Default padding for larger screens
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#9e9e9e", // Label color
                        fontSize: {
                          xs: "0.75rem", // Smaller label font for mobile
                          sm: "0.875rem", // Slightly larger for medium screens
                          md: "1rem", // Default font size for larger screens
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#00bcd4", // Focused label color
                      },
                    }}
                  />
                )}
              />
            </div>

            {/* Add Product */}
            <div className="relative group">
              <button
                onClick={() => setAddProductPopUp(true)}
                className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

                <span className="relative block md:px-6 md:py-3 px-4 py-2 rounded-xl bg-gray-950">
                  <div className="relative flex items-center space-x-2">
                    <span className="transition-all duration-500 group-hover:translate-x-1 md:text-lg text-sm">
                      Add Product
                    </span>
                    <IoIosAddCircle className="md:text-xl text-md transition-all duration-500 group-hover:translate-x-1" />
                  </div>
                </span>
              </button>
            </div>

            {/* Add Inquiry */}
            <div className="relative group">
              <button className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

                <span className="relative block md:px-6 md:py-3 px-4 py-2 rounded-xl bg-gray-950">
                  <div className="relative flex items-center space-x-2">
                    <span className="transition-all duration-500 group-hover:translate-x-1 md:text-lg text-sm">
                      Add Inquiry
                    </span>
                    <IoIosArrowForward className="md:text-xl text-md transition-all duration-500 group-hover:translate-x-1" />
                  </div>
                </span>
              </button>
            </div>
          </div>

          {items.length > 0 ? <ProductImagesList data={items} /> : null}
          {loader == true ? (
            <SyncLoader className="mt-4" color="#ffffff" />
          ) : null}

          {AddProductPopUp == true ? (
            <AddProduct setAddProductPopUp={setAddProductPopUp} />
          ) : null}
        </div>
      </div>
    </>
  );
}
