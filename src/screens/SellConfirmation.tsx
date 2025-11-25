import React from "react";
import { useParams } from "react-router";

const SellConfirmation: React.FC = () => {
  const { orderid } = useParams();

  return (
    <div className="mt-24 px-3 flex flex-col gap-8 max-w-lg mx-auto min-h-[600px]">
      SellConfirmation {orderid}
    </div>
  );
};

export default SellConfirmation;
