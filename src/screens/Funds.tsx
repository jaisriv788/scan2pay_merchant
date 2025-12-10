import type { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Funds: React.FC = () => {
  const [data, setData] = useState(null);

  const baseUrl = useSelector((state: RootState) => state?.consts?.baseUrl);
  const token = useSelector((state: RootState) => state?.user?.token);

  async function fetchData() {
    try {
      const response = await axios.post(
        `${baseUrl}/merchant/transaction-data-details`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.totals);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="mt-24 px-3 flex flex-col gap-8 max-w-lg mx-auto">
      Funds {data}
    </div>
  );
};

export default Funds;
