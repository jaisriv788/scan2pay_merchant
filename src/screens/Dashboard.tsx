import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import type { RootState } from "@/store/store";
import axios from "axios";
import { Sparkles, Wallet, CircleDollarSign, BarChart3, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface DashboardProps {
    usdtAmount?: number;
    usdcAmount?: number;
    transactionCount?: number;
    walletAddress?: number;
}

export default function DashboardPage() {
    const [loading, setloading] = useState(false);
    const [data, setData] = useState<DashboardProps | null>(null);

    const baseUrl = useSelector((state: RootState) => state?.consts?.baseUrl);
    const token = useSelector((state: RootState) => state?.user?.token);


    async function fetchData() {
        try {
            setloading(true);
            const response = await axios.post(
                `${baseUrl}/merchant/index`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response.data.data);

            if (response.data.status == "false") {
                setData(null);
                return;
            }

            setData({
                usdtAmount: response.data.data.usdt_amount,
                usdcAmount: response.data.data.usdc_amount,
                transactionCount: response.data.data.total_transactions,
                walletAddress: response.data.data.wallet_address,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setloading(false);
        }
    }

    useEffect(() => {
        fetchData();
        // console.log(transaction.length)
    }, []);
    return (
        <div className="mt-24 px-3 flex flex-col gap-8 max-w-lg mx-auto">

            {/* Page Header */}
            <div className="flex items-center justify-center gap-2">
                <Sparkles className="text-[#4D43EF] animate-pulse" />
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#4D43EF] to-blue-600 bg-clip-text text-transparent">
                    Dashboard Overview
                </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-6">

                {/* USDT */}
                <MagicCard
                    gradientColor="#b7b3ff"
                    className="p-5 rounded-2xl backdrop-blur-md border border-[#4D43EF]/40 
                    bg-white/60 hover:bg-[#4D43EF]/5 hover:shadow-xl transition-all duration-300"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle
                            className="text-lg font-semibold text-[#4D43EF]"
                        >
                            USDT Balance
                        </CardTitle>
                        <Wallet
                            size={24}
                            className="text-[#4D43EF] drop-shadow-sm animate-[pulse_2s_infinite]"
                        />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">
                            ${data?.usdtAmount ?? 0}
                        </p>
                    </CardContent>
                </MagicCard>

                {/* USDC */}
                <MagicCard
                    gradientColor="#a4f0b0"
                    className="p-5 rounded-2xl backdrop-blur-md border border-green-500/40 
                    bg-white/60 hover:bg-green-50 hover:shadow-xl transition-all duration-300"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-semibold text-green-700">
                            USDC Balance
                        </CardTitle>
                        <CircleDollarSign
                            size={24}
                            className="text-green-600 animate-[pulse_2s_infinite]"
                        />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">
                            ${data?.usdcAmount ?? 0}
                        </p>
                    </CardContent>
                </MagicCard>

                {/* Transaction Count */}
                <MagicCard
                    gradientColor="#b5cdf8"
                    className="p-5 rounded-2xl backdrop-blur-md border border-blue-500/40
                    bg-white/60 hover:bg-blue-50 hover:shadow-xl transition-all duration-300"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-semibold text-blue-700">
                            Total Transactions
                        </CardTitle>
                        <Receipt
                            size={24}
                            className="text-blue-600 animate-[pulse_2s_infinite]"
                        />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">
                            {data?.transactionCount ?? 0}
                        </p>
                    </CardContent>
                </MagicCard>

                {/* Total Business */}
                <MagicCard
                    gradientColor="#f5d3b0"
                    className="p-5 rounded-2xl backdrop-blur-md border border-orange-500/40
                    bg-white/60 hover:bg-orange-50 hover:shadow-xl transition-all duration-300"
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-semibold text-orange-700">
                            Total Business
                        </CardTitle>
                        <BarChart3
                            size={24}
                            className="text-orange-600 animate-[pulse_2s_infinite]"
                        />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">
                            ${data?.walletAddress ?? 0}
                        </p>
                    </CardContent>
                </MagicCard>

            </div>
        </div>
    );
}
