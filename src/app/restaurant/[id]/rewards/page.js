"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { getUserId } from "../../../utils/getUserId";
import { Gift, Coins, Wallet, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import BottomNav from "@/app/components/FixBottom";
import React from "react";
import { useCart } from "@/app/hooks/CartContext";
import { Mooli } from "next/font/google";
import Image from "next/image";

const mooli = Mooli({
  subsets: ["latin"],
  weight: ["400"],
});

export default function RewardsPage({ params }) {
  const { id: ownerId } = React.use(params);
  const { cart } = useCart();

  const [wallet, setWallet] = useState({
    coins: 0,
    rupees: 0,
    pendingCoins: 0,
    pendingRupees: 0,
  });

  const [offers, setOffers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    async function fetchWallet() {
      setLoading(true);
      try {
        const userId = getUserId();
        if (!userId) return;

        const walletRef = doc(db, "users", userId, "wallet", "balance");
        const snap = await getDoc(walletRef);
        if (snap.exists()) {
          setWallet(snap.data());
        } else {
          setWallet({ coins: 0, rupees: 0, pendingCoins: 0, pendingRupees: 0 });
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTransactions() {
      try {
        const userId = getUserId();
        if (!userId) return;

        const txnRef = collection(db, "users", userId, "transactions");
        const q = query(txnRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const txs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate().toLocaleDateString() || "",
        }));

        setTransactions(txs);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    }

    function fetchOffers() {
      setOffers([
        { id: 1, title: "Free Cold Drink", desc: "Redeem 2000 Coins for one complimentary soft drink.", cost: 2000, img: "https://images.unsplash.com/photo-1598038990523-32bcaa29f679?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0", color: "bg-yellow-400" },
        { id: 2, title: "Flat 20% Off", desc: "Redeem 5000 Coins to get 20% off your entire bill.", cost: 5000, img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60", color: "bg-purple-400" },
        { id: 3, title: "Free Dessert of the Day", desc: "Redeem 1500 Coins for a sweet surprise.", cost: 1500, img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60", color: "bg-green-400" },
        { id: 4, title: "₹50 Wallet Credit", desc: "Redeem 8000 Coins to instantly get ₹50 added to your wallet.", cost: 8000, img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60", color: "bg-red-400" },
      ]);
    }

    fetchWallet();
    fetchTransactions();
    fetchOffers();
  }, []);

  const handleWithdraw = () => {
    alert("Withdraw request placed ✅ (yaha tu backend/Firebase call kar sakta hai)");
  };

  const handleRedeem = (offer) => {
    alert(`Redeem request for "${offer.title}" placed!`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-900 text-white flex items-center justify-center ${mooli.className}`}>
        <p className="text-xl text-yellow-400">Loading Rewards...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${mooli.className}`}>
      <header className="pt-8 pb-4 px-6 bg-gray-900 sticky top-0 z-10 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-400 flex items-center">
            <Gift className="w-8 h-8 mr-2" /> Rewards Hub
          </h1>
        </div>
      </header>

      <main className="p-6">
        {/* Wallet Section */}
        <div
          className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-2xl shadow-2xl max-w-lg mx-auto mb-10 border border-yellow-500/50 cursor-pointer transition hover:scale-[1.01]"
          onClick={() => setWalletOpen(!walletOpen)}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <p className="text-gray-300 text-sm flex items-center mb-1">
                <Wallet className="w-4 h-4 mr-2 text-yellow-400" /> Current Balance
              </p>
              <h2 className="text-3xl font-bold text-yellow-400">₹{wallet.rupees}</h2>
              <p className="text-gray-400 text-sm mt-1">Pending: ₹{wallet.pendingRupees || 0}</p>
            </div>

            <div className="text-right p-3 bg-gray-900/50 rounded-xl">
              <p className="text-sm text-purple-300">Reward Coins</p>
              <div className="flex items-center justify-end space-x-2">
                <Coins className="w-6 h-6 text-purple-400" />
                <p className="text-2xl font-bold text-purple-400">{wallet.coins.toLocaleString()}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Pending: {wallet.pendingCoins?.toLocaleString() || 0}</p>
            </div>
            {walletOpen ? <ChevronUp className="text-yellow-400" /> : <ChevronDown className="text-yellow-400" />}
          </div>

          {/* Expandable Transactions */}
          {walletOpen && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Recent Transactions</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {transactions.map((tx) => (
                  <li key={tx.id} className="bg-gray-800/70 p-3 rounded-lg flex justify-between items-center text-sm">
                    <div>
                      <p className={`${tx.type === "Added" ? "text-green-400" : "text-red-400"} font-bold`}>{tx.amount}</p>
                      <p className="text-gray-400">{tx.reason}</p>
                    </div>
                    <span className="text-xs text-gray-500">{tx.date}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleWithdraw}
                className="mt-4 w-full py-2 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400 transition"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>

        {/* Offers Section */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-2">Exclusive Coin Rewards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col transition duration-300 hover:ring-2 hover:ring-yellow-500/50"
            >
              <div className="relative w-full h-48">
                <Image
                  src={offer.img}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-110"
                />
                <div className="absolute top-0 right-0 p-2 m-2 bg-black/70 backdrop-blur-sm rounded-full flex items-center text-white font-bold text-sm shadow-lg">
                  <Coins className="w-4 h-4 mr-1 text-purple-400" /> {offer.cost.toLocaleString()}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">{offer.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{offer.desc}</p>

                <button
                  onClick={() => handleRedeem(offer)}
                  disabled={wallet.coins < offer.cost}
                  className={`mt-auto px-6 py-3 rounded-full font-semibold shadow-lg transition duration-200 ${
                    wallet.coins >= offer.cost
                      ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400 active:scale-[.98]"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {wallet.coins >= offer.cost ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" /> Redeem Offer
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <XCircle className="w-5 h-5 mr-2" /> Need {offer.cost - wallet.coins} More Coins
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="mt-12">
        <BottomNav ownerId={ownerId} cart={cart} />
      </div>
    </div>
  );
}
