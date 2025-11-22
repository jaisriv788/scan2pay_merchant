import React from "react";
import DepositeForm from "@/components/wallet/DepositeForm";
import DataBox from "@/components/wallet/DataBox";

const Wallet: React.FC = () => {




    return (
        <div className="mt-24 px-2 flex flex-col gap-5 max-w-lg mx-auto">
            <DataBox />

            <div className="text-2xl font-bold">Deposite Amount</div>

            <DepositeForm />

        </div>
    );
};

export default Wallet;
