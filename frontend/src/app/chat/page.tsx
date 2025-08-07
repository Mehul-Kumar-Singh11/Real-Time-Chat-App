"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/Loading";

const ChatApp = () => {
  const { loading, isAuth } = useAppData();

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) {
    return <Loading />;
  }

  return <div>ChatApp</div>;
};

export default ChatApp;
