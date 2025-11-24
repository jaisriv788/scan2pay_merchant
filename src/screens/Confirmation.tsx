import React, { useEffect } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { Loader } from "lucide-react";

const Confirmation: React.FC = () => {
  const { orderid } = useParams();

  const [loading, setLoading] = React.useState(true);

  //from here the work will statrt as we have to hiut the api at time interval and check the status.
  useEffect(() => {
    let interval = setInterval(() => {}, 5000);

    return () => clearInterval(interval);
  }, []);

  return loading ? (
    <div className="mt-24 px-3 flex flex-col gap-8 max-w-lg mx-auto min-h-[600px] ">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white flex-1 items-center justify-center shadow-2xl rounded-2xl px-8 py-10 w-full flex flex-col"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1,
          }}
        ></motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-lg font-semibold">Loading...</p>
          <p className="text-gray-500 text-sm mt-1">
            Please wait while we are preparing things.
          </p>
        </motion.div>
      </motion.div>
    </div>
  ) : (
    <div className="mt-24 px-3 flex flex-col gap-8 max-w-lg mx-auto">
      no {orderid}
    </div>
  );
};

export default Confirmation;
