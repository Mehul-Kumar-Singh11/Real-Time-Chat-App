import Loading from "@/components/Loading";
import VerifyOTP from "@/components/VerifyOTP";
import { Suspense } from "react";

const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOTP />
    </Suspense>
  );
};

export default VerifyPage;
