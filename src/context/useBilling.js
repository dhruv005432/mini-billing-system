import { useContext } from "react";
import { BillingContext } from "./BillingContextDef";

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
};

export default useBilling;
