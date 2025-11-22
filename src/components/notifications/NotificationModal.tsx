// src/components/notifications/NotificationSlider.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type Order = {
    id: number;
    order_id?: string;
    amount?: number;
    inr_amount?: number;
    type?: string;
    created_at?: string;
    user_id?: number;
};

type Props = {
    notifications?: Order[];
    onAccept: (o: Order) => void;
    onDeny: (o: Order) => void;
    onClose: (o: Order) => void;
};

const NotificationSlider: React.FC<Props> = ({
    notifications = [],
    onAccept,
    onDeny,
    onClose,
}) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
            <AnimatePresence>
                {(notifications ?? []).map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        className="w-80 p-4 bg-white rounded-xl shadow-lg border border-slate-200"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-sm">New Order</h3>
                            <button
                                onClick={() => onClose(order)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="text-sm text-slate-700 space-y-1 mb-3">
                            <div><strong>Order ID:</strong> {order.order_id}</div>
                            <div><strong>User:</strong> {order.user_id}</div>
                            <div><strong>Amount:</strong> {order.amount} {order.type}</div>
                            <div><strong>INR:</strong> ₹{order.inr_amount}</div>
                            <div>
                                <strong>Time:</strong>{" "}
                                {order.created_at &&
                                    new Date(order.created_at).toLocaleTimeString()}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => onDeny(order)}
                                className="rounded-md px-3 py-1.5 text-sm border border-slate-200"
                            >
                                Deny
                            </button>
                            <button
                                onClick={() => onAccept(order)}
                                className="rounded-md px-3 py-1.5 text-sm bg-blue-600 text-white"
                            >
                                Accept
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationSlider;
