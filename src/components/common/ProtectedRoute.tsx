import React, { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { setIsUserConnected } from "@/store/slices/userSlice";
import axios from "axios";
import NotificationSlider from "../notifications/NotificationModal";
import { readSeenIds, writeSeenIds } from "@/utils/seenStorage";
import { useShowSuccess } from "@/hooks/useShowSuccess";
import { useShowError } from "@/hooks/useShowError";

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

const ProtectedRoute: React.FC = () => {
  const isConnected = useSelector((state: RootState) => state.user.isConnected);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch<AppDispatch>();

  const { showSuccess } = useShowSuccess();
  const { showError } = useShowError();
  const navigate = useNavigate();

  const baseUrl = useSelector((state: RootState) => state.consts.baseUrl);
  const token = useSelector((state: RootState) => state.user.token);
  const user = useSelector((state: RootState) => state.user.userData);

  const [queue, setQueue] = useState<Order[]>([]);
  const [current, setCurrent] = useState<Order | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null); // NEW — for fade-out

  const intervalRef = useRef<number | null>(null);
  const processingRef = useRef<Set<number>>(new Set()); // avoids reappearing

  /** Set axios Bearer token automatically */
  useEffect(() => {
    if (token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, [token]);

  /** Detect offline */
  useEffect(() => {
    if (!isOnline) dispatch(setIsUserConnected({ isConnected: false }));
  }, [isOnline]);

  /** Push unseen orders into queue */
  const pushUnseenToQueue = (orders: Order[]) => {
    const seen = new Set(readSeenIds());

    const unseen = orders.filter(
      (o) =>
        !seen.has(o.id) &&
        !processingRef.current.has(o.id) &&
        o.status === "pending"
    );

    if (unseen.length > 0) {
      setQueue((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const fresh = unseen.filter((o) => !existing.has(o.id));
        return [...prev, ...fresh];
      });
    }
  };

  /** Polling API for pending orders */
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

      const payload = response?.data?.data;
      const orders: Order[] = payload?.pendingOrders ?? payload ?? [];

      if (Array.isArray(orders)) pushUnseenToQueue(orders);
    } catch (err) {
      console.error("Pending fetch failed:", err);
    }
  };

  /** Start polling */
  useEffect(() => {
    fetchPending();
    intervalRef.current = window.setInterval(fetchPending, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [baseUrl, token]);

  /** Handle order transitioning from queue to current */
  useEffect(() => {
    if (queue.length === 0 || current) return;

    const next = queue[0];

    processingRef.current.add(next.id);
    setCurrent(next);
    setQueue((q) => q.slice(1));
  }, [queue]);

  /** Save seen ID */
  const markSeen = (id: number) => {
    const seen = new Set(readSeenIds());
    seen.add(id);
    writeSeenIds([...seen]);
  };

  /** ORDER ACTIONS */
  const handleAccept = async (o: Order) => {
    processingRef.current.add(o.id);
    markSeen(o.id);
    setClosingId(o.id); // animate out

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

  const handleDeny = async (o: Order) => {
    processingRef.current.add(o.id);
    markSeen(o.id);
    setClosingId(o.id);

    try {
      const res = await axios.post(`${baseUrl}/merchant/reject-buy-order`, {
        order_id: o.order_id,
      });

      if (res.data.status) {
        showError("Order rejected successfully", "");
      }
    } catch (err) {
      console.warn("Deny failed:", err);
    }
  };

  const handleClose = (o: Order) => {
    processingRef.current.add(o.id);
    markSeen(o.id);
    setClosingId(o.id);
  };

  /** When exit animation finishes, fully clear */
  const handleExitComplete = (id: number) => {
    if (closingId === id) {
      setCurrent(null);
      setClosingId(null);
    }
  };

  return isConnected ? (
    <>
      <Sidebar />
      <Navbar />
      <Outlet />

      <NotificationSlider
        notifications={current ? [current] : []}
        closingId={closingId}
        onAccept={handleAccept}
        onDeny={handleDeny}
        onClose={handleClose}
        onExited={handleExitComplete}
      />
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;
