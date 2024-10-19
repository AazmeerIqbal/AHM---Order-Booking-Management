"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const MasterPage = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log(status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return <div className="">{children}</div>;
};

export default MasterPage;
