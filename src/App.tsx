import React, { useEffect, useLayoutEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Error from './components/common/Error'
import Success from './components/common/Success'
import PublicRoute from './components/common/PublicRoute'
import ProtectedRoute from './components/common/ProtectedRoute'
import Verification from './components/common/Verification'
import Profile from './screens/Profile'
import Transaction from './screens/Transaction'
import Wallet from './screens/Wallet'
import axios from 'axios'

const App: React.FC = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const baseUrl = useSelector((state: RootState) => state?.consts?.baseUrl);
  const token = useSelector((state: RootState) => state?.user?.token);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${baseUrl}/merchant/pending-orders`
      );
      console.log(response.data.data);
    }
    fetchData();

    setInterval(async () => {
      const response = await axios.get(
        `${baseUrl}/merchant/pending-orders`
      );
      console.log(response.data.data);
    }, 10000);
  }, [])

  const showError = useSelector(
    (state: RootState) => state.model.showErrorModel
  );

  const showSuccess = useSelector(
    (state: RootState) => state.model.showSuccessModel
  );
  return (
    <>
      {showError && <Error />}
      {showSuccess && <Success />}
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
          {/* <Route path="/support" element={<Support />} /> */}
        </Route>
      </Routes>
    </>
  )
}

export default App