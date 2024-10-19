"use client";

import localFont from "next/font/local";
import "./globals.css";
import Login from "./login/page";
import Provider from "@/components/Provider";
import MasterPage from "@/components/MasterPage";
import { usePathname } from "next/navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>AHM - OBM</title>
        <link rel="icon" type="image/x-icon" href="" />
      </head>
      <Provider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {pathname === "/login" ? (
            <Login />
          ) : (
            <MasterPage>{children}</MasterPage>
          )}
        </body>
      </Provider>
    </html>
  );
}
