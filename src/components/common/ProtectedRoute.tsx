// import React, { useEffect } from "react";
// import { Navigate, Outlet } from "react-router";
// import { useSelector, useDispatch } from "react-redux";
// import type { RootState, AppDispatch } from "@/store/store";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
// // import ConnectionSlider from "./ConnectionSlider";
// import useOnlineStatus from "@/hooks/useOnlineStatus";
// import { setIsUserConnected } from "@/store/slices/userSlice";

// const ProtectedRoute: React.FC = () => {
//   const isConnected = useSelector((state: RootState) => state.user.isConnected);
//   const isOnline = useOnlineStatus();
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     if (!isOnline) {
//       dispatch(setIsUserConnected({ isConnected: false }));
//     }
//   }, [isOnline]);

//   return isConnected ? (
//     <>
//       {/* <ConnectionSlider /> */}
//       <Sidebar />
//       <Navbar />
//       <Outlet />
//     </>
//   ) : (
//     <Navigate to="/" replace />
//   );
// };

// export default ProtectedRoute;


// src/components/common/ProtectedRoute.tsx




// src/components/common/ProtectedRoute.tsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { setIsUserConnected } from "@/store/slices/userSlice";
import axios from "axios";
import NotificationSlider from "../notifications/NotificationModal";
import { readSeenIds, writeSeenIds } from "@/utils/seenStorage";

type Order = {
  id: number;
  order_id?: string;
  user_id?: number;
  amount?: number;
  inr_amount?: number;
  status?: string;
  type?: string;
  created_at?: string;
};

const ProtectedRoute: React.FC = () => {
  const isConnected = useSelector((state: RootState) => state.user.isConnected);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch<AppDispatch>();

  const baseUrl = useSelector((state: RootState) => state.consts.baseUrl);
  const token = useSelector((state: RootState) => state.user.token);

  const [queue, setQueue] = useState<Order[]>([]);
  const [current, setCurrent] = useState<Order | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Update axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (!isOnline) {
      dispatch(setIsUserConnected({ isConnected: false }));
    }
  }, [isOnline]);

  // Add unseen orders into queue
  const pushUnseenToQueue = (orders: Order[]) => {
    const seen = new Set(readSeenIds());
    const unseen = orders.filter(
      (o) => !seen.has(o.id) && o.status === "pending"
    );

    if (unseen.length > 0) {
      setQueue((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const fresh = unseen.filter((o) => !existing.has(o.id));
        return [...prev, ...fresh];
      });
    }
  };

  // If no active card and queue has items, show next
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  const fetchPending = async () => {
    try {
      const response = await axios.get(`${baseUrl}/merchant/pending-orders`);
      const payload = response?.data?.data;

      const orders: Order[] =
        payload?.pendingOrders ?? payload ?? [];

      if (Array.isArray(orders)) {
        pushUnseenToQueue(orders);
      }
    } catch (err) {
      console.error("Pending order fetch failed:", err);
    }
  };

  // Start polling
  useEffect(() => {
    fetchPending();
    intervalRef.current = window.setInterval(fetchPending, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [baseUrl, token]);

  const markSeen = (id: number) => {
    const seen = new Set(readSeenIds());
    seen.add(id);
    writeSeenIds([...seen]);
  };

  const handleAccept = async (o: Order) => {
    markSeen(o.id);
    setCurrent(null);
    try {
      await axios.post(`${baseUrl}/merchant/orders/${o.id}/accept`);
    } catch (err) {
      console.warn("Accept failed:", err);
    }
  };

  const handleDeny = async (o: Order) => {
    markSeen(o.id);
    setCurrent(null);
    try {
      await axios.post(`${baseUrl}/merchant/orders/${o.id}/deny`);
    } catch (err) {
      console.warn("Deny failed:", err);
    }
  };

  const handleClose = (o: Order) => {
    markSeen(o.id);
    setCurrent(null);
  };

  return isConnected ? (
    <>
      <Sidebar />
      <Navbar />
      <Outlet />

      <NotificationSlider
        notifications={current ? [current] : []}
        onAccept={handleAccept}
        onDeny={handleDeny}
        onClose={handleClose}
      />
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;
