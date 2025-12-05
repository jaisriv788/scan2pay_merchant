import type { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { readSeenIds, writeSeenIds } from "@/utils/seenStorage";
import { useShowSuccess } from "@/hooks/useShowSuccess";
import { useShowError } from "@/hooks/useShowError";
import { useNavigate } from "react-router";

type Order = {
  id: number;
  order_id?: string;
  user_id?: number;
  amount?: number;
  inr_amount?: number;
  status?: string;
  type?: string;
  created_at?: string;
  order_type?: string;
  upi_id?: string;
};

const PendingRequest: React.FC = () => {
  const baseUrl = useSelector((state: RootState) => state.consts.baseUrl);
  const token = useSelector((state: RootState) => state.user.token);
  const user = useSelector((state: RootState) => state.user.userData);

  const [data, setData] = React.useState([]);

  const { showSuccess } = useShowSuccess();
  const { showError } = useShowError();

  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/merchant/pending-orders`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Pending orders response:", response.data);
      setData(response.data.data.pendingOrders || []);
    } catch (err) {
      console.error("Pending fetch failed:", err);
    }
  };

  /** Start polling */
  useEffect(() => {
    fetchPending();
    setInterval(() => fetchPending(), 10000);
  }, []);

  const markSeen = (id: number) => {
    const seen = new Set(readSeenIds());
    seen.add(id);
    writeSeenIds([...seen]);
  };

  const handleAccept = async (o: Order) => {
    markSeen(o.id);

    try {
      const res = await axios.post(`${baseUrl}/merchant/accept-buy-order`, {
        order_id: o?.order_id,
        merchant_id: user?.id,
      });

      console.log("Accept response:", res.data);

      if (res.data.status) {
        showSuccess("Order accepted successfully", "");
        if (o.order_type === "buy") navigate(`/confirmation/${o.order_id}`);
        else if (o.order_type === "sell")
          navigate(
            `/sell-confirmation/${o.order_id}/${res.data.upi_id}/${o.amount}`
          );
        else
          navigate(
            `/scan-confirmation/${o.order_id}/${res.data.upi_id}/${o.amount}`
          );
      } else {
        showError("Order acceptance failed.", res.data.message);
      }
    } catch (err) {
      console.warn("Accept failed:", err);
    }
  };

  return (
    <div className="mt-18 px-2 flex flex-col gap-4 max-w-lg mx-auto">
      <div className="w-full rounded-xl border p-4 shadow-sm bg-white overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>

        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead>ID</TableHead> */}
              <TableHead>Order ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>INR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length == 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center pt-5">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  {/* <TableCell>{item.id}</TableCell> */}
                  <TableCell>{item.order_id}</TableCell>
                  <TableCell className="capitalize">
                    {item.order_type}
                  </TableCell>
                  <TableCell>{parseFloat(item.amount).toFixed(2)}</TableCell>
                  <TableCell>₹{item.inr_amount}</TableCell>
                  <TableCell className="capitalize">{item.status}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleString().slice(0, 10)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleAccept(item)}
                      size="sm"
                      className="cursor-pointer transition ease-in-out duration-300 hover:bg-[#4D43EF]/70 bg-[#4D43EF]"
                    >
                      Accept
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PendingRequest;
