import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
// import ConnectionSlider from "./ConnectionSlider";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { setIsUserConnected } from "@/store/slices/userSlice";

const ProtectedRoute: React.FC = () => {
  const isConnected = useSelector((state: RootState) => state.user.isConnected);
  const isOnline = useOnlineStatus();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isOnline) {
      dispatch(setIsUserConnected({ isConnected: false }));
    }
  }, [isOnline]);

  return isConnected ? (
    <>
      {/* <ConnectionSlider /> */}
      <Sidebar />
      <Navbar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;
