import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

import axios from "axios";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const DepositeForm: React.FC = () => {
  const [type, setType] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [amount2, setAmount2] = useState("");
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [loading2, setLoading2] = useState(false);
  const baseUrl = useSelector((state: RootState) => state?.consts?.baseUrl);
  // const userData = useSelector((state: RootState) => state?.user?.userData);
  const token = useSelector((state: RootState) => state?.user?.token);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/merchant/update-crypto-balance`,
        {
          type: type.toLocaleLowerCase(),
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 p-4 rounded-xl border shadow-sm bg-white">
        {/* Amount + Select row */}
        <div className="text-2xl font-bold">Deposite Amount</div>
        <div className="flex gap-3">
          {/* Amount Input */}
          <Input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />

          {/* Select Dropdown */}
          <Select onValueChange={(val) => setType(val)} defaultValue={type}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !amount}
          className="bg-[#847EF1] cursor-pointer transition ease-in-out duration-300 hover:bg-[#847EF1]/50 text-white font-medium"
        >
          {loading ? "Loading..." : "Add To Wallet"}
        </Button>
      </div>
      <div className="flex flex-col gap-5 p-4 rounded-xl border shadow-sm bg-white">
        {/* Amount + Select row */}
        <div className="text-2xl font-bold">Withdraw Amount</div>
        <div className="flex gap-3">
          {/* Amount Input */}
          <Input
            type="number"
            placeholder="Enter Amount"
            value={amount2}
            onChange={(e) => setAmount2(e.target.value)}
            className="flex-1"
          />

          {/* Select Dropdown */}
          <Select onValueChange={(val) => setType(val)} defaultValue={type}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
        //   onClick={handleSubmit}
          disabled={loading2 || !amount2}
          className="bg-[#847EF1] cursor-pointer transition ease-in-out duration-300 hover:bg-[#847EF1]/50 text-white font-medium"
        >
          {loading ? "Loading..." : "Withdraw from Wallet"}
        </Button>
      </div>
    </>
  );
};

export default DepositeForm;
