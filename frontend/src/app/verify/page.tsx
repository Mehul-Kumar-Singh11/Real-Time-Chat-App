import React from "react";
import VerifyOTP from "@/components/VerifyOTP";
import { Suspense } from "react";
import Loading from "@/components/Loading";

const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOTP />
    </Suspense>
    <Suspense fallback={<Loading />}>
      <VerifyOTP />
    </Suspense>
  );
};

export default VerifyPage;
