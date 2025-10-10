import React from "react";
import { Wallet } from "lucide-react";
const WalletPage = ({earning}) => (
    <div className="bg-white p-6 rounded-2xl shadow text-center">
      <Wallet className="w-10 h-10 text-green-600 mx-auto mb-3" />
      <h2 className="text-2xl font-semibold mb-2">Wallet Balance</h2>
      <p className="text-4xl font-bold text-green-700">₹{earning}</p>
      <p className="text-gray-500 mt-2">Updated in real-time</p>
    </div>
  );

  export default WalletPage;