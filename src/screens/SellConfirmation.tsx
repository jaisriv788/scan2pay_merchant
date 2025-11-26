import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useShowError } from "@/hooks/useShowError";
import { useShowSuccess } from "@/hooks/useShowSuccess";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { setTrxSuccess } from "@/store/slices/modelSlice";
import { setTrxFail } from "@/store/slices/modelSlice";

const SellConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { orderid, upi_id, amount } = useParams<{
    orderid?: string;
    upi_id?: string;
    amount?: string;
  }>();

  const [orderData, setOrderData] = useState<{
    order_id?: string | null;
    upi_id?: string | null;
    inr_amount?: string | null;
  }>({
    order_id: null,
    upi_id: null,
    inr_amount: null,
  });

  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.user.token);
  const baseUrl = useSelector((state: RootState) => state.consts.baseUrl);

  const { showError } = useShowError();
  const { showSuccess } = useShowSuccess();

  const [transactionId, setTransactionId] = useState<string>("");
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // console.log(imagePreview);
    setOrderData({
      order_id: orderid ?? null,
      upi_id: upi_id ?? null,
      inr_amount: amount ?? null,
    });
  }, [orderid, upi_id, amount]);

  // useEffect(() => {
  //   if (!imageFile) {
  //     setImagePreview(null);
  //     return;
  //   }
  //   const reader = new FileReader();
  //   reader.onload = () => setImagePreview(String(reader.result));
  //   reader.readAsDataURL(imageFile);
  //   return () => {
  //     // cleanup if needed
  //   };
  // }, [imageFile]);

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] ?? null;
  //   setImageFile(file);
  // };

  const handleCopyUPI = async () => {
    const text = orderData.upi_id ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // optional: show toast / feedback
      console.log("UPI copied:", text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("order_id", orderData?.order_id);
      formData.append("upi_reference", transactionId);
      // formData.append("screenshot", imageFile);

      // console.log({ order_id, transactionId, imageFile });
      const response = await axios.post(
        `${baseUrl}/submit-payment-proof`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        showSuccess(
          "Payment proof submitted successfully.",
          "Please wait for the merchant to accept the payment release."
        );
        setConfirmed(true);
      }
    } catch (error) {
      console.log(error);
      showError("Something went wrong while submitting.", "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!confirmed) {
      return;
    }

    let interval = setInterval(async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/confirm-order-status`,
          { order_id: orderData?.order_id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        if (response.data.order_status === "completed") {
          setConfirmed(false);
          showSuccess(
            "Payment proof submitted successfully.",
            "Please wait for the merchant to accept the payment release."
          );
          navigate("/dashboard");
          dispatch(setTrxSuccess({ showTrxSuccess: true }));
          clearInterval(interval);
        }
      } catch (error) {
        console.log(error);
        dispatch(setTrxFail({ showTrxFail: true }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [confirmed]);
  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50 py-12">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-2xl  mt-18 border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                Confirm & Pay
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Pay the merchant using the QR or UPI details below.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-800">
                {orderData.order_id ?? "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: QR + UPI */}
            <div className="flex flex-col items-center justify-start gap-4 bg-gradient-to-br from-white to-slate-50 p-4 rounded-lg border border-gray-100">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <QRCodeCanvas
                  value={`upi://pay?pa=${orderData?.upi_id ?? ""}&am=${
                    orderData?.inr_amount ?? ""
                  }&cu=INR`}
                  size={200}
                  level="H"
                />
              </div>

              <div className="w-full text-center">
                <div className="text-sm text-gray-500">UPI ID</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="font-mono text-sm bg-slate-100 px-3 py-2 rounded text-gray-800 break-all">
                    {orderData.upi_id ?? "—"}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    Copy
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  Amount
                  <div className="mt-1 text-lg font-extrabold text-[#4D43EF]">
                    {orderData.inr_amount ? `₹ ${orderData.inr_amount}` : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form (Transaction ID + Image upload) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Transaction ID
                </label>
                <input
                  type="text"
                  disabled={loading || confirmed}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter Transaction ID"
                  className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D43EF] focus:border-transparent bg-white"
                />
              </div>

              {/* <div>
                <label className="text-sm font-medium text-gray-600">
                  Upload Screenshot (optional)
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-gray-200 bg-white hover:bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 3a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0016.414 6L13 2.586A2 2 0 0011.586 2H4z" />
                    </svg>
                    <span className="text-sm text-gray-600">Choose image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                      className="hidden"
                    />
                  </label>

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center rounded-md bg-gray-50 border">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  PNG / JPG — up to 5MB
                </p>
              </div> */}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || confirmed}
                  className="w-full py-3 cursor-pointer rounded-lg bg-[#4D43EF] text-white font-semibold hover:bg-[#372fce] transition ease-in-out duration-300"
                >
                  {!confirmed &&
                    (loading ? "Submitting..." : "Submit & Confirm")}
                  {confirmed && "Verifying..."}
                </button>
              </div>

              <div className="text-xs text-gray-400">
                By submitting, you confirm that you have completed the payment
                to the merchant.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellConfirmation;
