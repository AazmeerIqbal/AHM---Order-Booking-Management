"use client";

import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { encrypt } from "@/utils/encryption";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Notification Toaster
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define validation schema using Yup
const validationSchema = Yup.object().shape({
  UserName: Yup.string().required("Username is required"),
  Password: Yup.string().required("Password is required"),
});

const Login = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      UserName: "",
      Password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      const pass = encrypt(values.Password);

      const result = await signIn("credentials", {
        redirect: false,
        username: values.UserName,
        password: pass,
      });

      if (result?.ok) {
        router.push("/");
      } else {
        toast.error("Invalid username or password", {
          position: "top-right",
        });
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="flex justify-center items-center h-screen absolute inset-0 -z-10 w-full px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
      <div className="lg:w-1/2 xl:w-1/3 md:w-2/3 sm:w-full p-6 bg-[rgba(0,0,0,0.6)] rounded-lg drop-shadow-lg">
        <div className="flex justify-center mb-4">
          <img
            src="assets/logo2.png"
            alt="Login Image"
            className="w-32 h-32 "
          />
        </div>
        {/* <h2 className="text-3xl font-bold text-gray-200 text-center mb-4">
          Login
        </h2> */}
        <div className="w-full flex-1 mt-8">
          <div className="mx-auto max-w-xs">
            <form onSubmit={formik.handleSubmit}>
              <input
                className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white text-black"
                type="text"
                name="UserName"
                value={formik.values.UserName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Username"
                autoComplete="off"
              />
              {formik.touched.UserName && formik.errors.UserName ? (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.UserName}
                </div>
              ) : null}

              <div className="relative mt-5">
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white text-black"
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  value={formik.values.Password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {formik.touched.Password && formik.errors.Password ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.Password}
                  </div>
                ) : null}
              </div>

              <button
                className="mt-5 tracking-wide font-semibold bg-[#63e] text-white w-full py-4 rounded-lg hover:bg-[#4eb3ff] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none shadow-lg"
                type="submit"
                disabled={formik.isSubmitting}
              >
                <span className="ml-3">Sign In</span>
                <FaSignInAlt className="ml-2 mt-1" />
              </button>
            </form>
            <p className="mt-6 text-xs text-gray-400 text-center">
              Powered by Cli-X
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
