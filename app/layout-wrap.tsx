import { Toaster } from "@/components/ui/sonner";
import React from "react";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster position="bottom-right" />
      {children}
    </>
  );
};

export default LayoutWrapper;
