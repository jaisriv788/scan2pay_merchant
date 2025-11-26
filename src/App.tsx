import React, { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import { useSelector } from "react-redux";
import type { RootState } from "./store/store";
import Error from "./components/common/Error";
import Success from "./components/common/Success";
import PublicRoute from "./components/common/PublicRoute";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Verification from "./components/common/Verification";
import Profile from "./screens/Profile";
import Transaction from "./screens/Transaction";
import Wallet from "./screens/Wallet";
import Confirmation from "./screens/Confirmation";
import TrxConfirm from "./components/common/TrxConfirm";
import TrxError from "./components/common/TrxError";
import SellConfirmation from "./screens/SellConfirmation";

const App: React.FC = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const showError = useSelector(
    (state: RootState) => state.model.showErrorModel
  );
  const showSuccess = useSelector(
    (state: RootState) => state.model.showSuccessModel
  );
  const showTrxFail = useSelector(
    (state: RootState) => state.model.showTrxFail
  );
  const showTrxSuccess = useSelector(
    (state: RootState) => state.model.showTrxSuccess
  );
  return (
    <>
      {showError && <Error />}
      {showSuccess && <Success />}
      <TrxConfirm open={showTrxSuccess} />
      <TrxError open={showTrxFail} />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/auth/verification" element={<Verification />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transactions" element={<Transaction />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/confirmation/:orderid" element={<Confirmation />} />
          <Route
            path="/sell-confirmation/:orderid/:upi_id/:amount"
            element={<SellConfirmation />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
