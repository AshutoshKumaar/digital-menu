"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { getUserId } from "@/app/utils/getUserId";
import { Gift, Coins, Wallet, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import BottomNav from "@/app/components/FixBottom";
import Image from "next/image";
import { Mooli } from "next/font/google";

const mooli = Mooli({ subsets: ["latin"], weight: ["400"] });

export default function RewardsPage({ params }) {
  const ownerId = React.use(params).id

  const [wallet, setWallet] = useState({
    coins: 0,
    rupees: 0,
    pendingCoins: 0,
    pendingRupees: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    const fetchWalletAndTransactions = async () => {
      try {
        setLoading(true);

        const { uid } = await getUserId(); // ✅ Properly await async call
        if (!uid) {
          console.error("User not logged in!");
          return;
        }

        const safeUserId = uid;

        // ✅ Fetch wallet
        const walletRef = doc(db, "users", safeUserId, "wallet", "balance");
        const walletSnap = await getDoc(walletRef);
        const walletData = walletSnap.exists()
          ? walletSnap.data()
          : { coins: 0, rupees: 0, pendingCoins: 0, pendingRupees: 0 };
        setWallet(walletData);

        // ✅ Fetch transactions
        const txnCol = collection(db, "users", safeUserId, "transactions");
        const txnQuery = query(txnCol, orderBy("date", "desc"));
        const txnSnap = await getDocs(txnQuery);
        const txs = txnSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          date: d.data().date?.toDate()?.toLocaleDateString() || "",
        }));
        setTransactions(txs);

        // ✅ Static offers (same design)
        setOffers([
          {
            id: 1,
            title: "Free Cold Drink",
            desc: "Redeem 2000 Coins for one complimentary soft drink.",
            cost: 2000,
            img: "https://images.unsplash.com/photo-1598038990523-32bcaa29f679?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0",
            color: "bg-yellow-400",
          },
          {
            id: 2,
            title: "Flat 20% Off",
            desc: "Redeem 5000 Coins to get 20% off your entire bill.",
            cost: 5000,
            img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60",
            color: "bg-purple-400",
          },
          {
            id: 3,
            title: "Free Dessert of the Day",
            desc: "Redeem 1500 Coins for a sweet surprise.",
            cost: 1500,
            img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60",
            color: "bg-green-400",
          },
          {
            id: 4,
            title: "₹50 Wallet Credit",
            desc: "Redeem 8000 Coins to instantly get ₹50 added to your wallet.",
            cost: 8000,
            img: "https://images.unsplash.com/photo-1744893174562-7b386359bae7?w=600&auto=format&fit=crop&q=60",
            color: "bg-red-400",
          },
        ]);
      } catch (err) {
        console.error("❌ Error fetching wallet & transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletAndTransactions();
  }, []);

  const handleWithdraw = () => alert("Withdraw request placed ✅");
  const handleRedeem = (offer) =>
    alert(`Redeem request for "${offer.title}" placed!`);

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-900 text-white flex items-center justify-center ${mooli.className}`}
      >
        <p className="text-xl text-yellow-400">Loading Rewards...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${mooli.className}`}>
      {/* HEADER */}
      <header className="pt-8 pb-4 px-6 bg-gray-900 sticky top-0 z-10 border-b border-gray-800">
        <h1 className="text-3xl font-extrabold text-yellow-400 flex items-center">
          <Gift className="w-8 h-8 mr-2" /> Rewards Hub
        </h1>
      </header>

      {/* MAIN */}
      <main className="p-6">
        {/* WALLET SECTION */}
        <div
          className="bg-gray-800 p-6 rounded-2xl mb-10 cursor-pointer hover:scale-[1.01] transition"
          onClick={() => setWalletOpen(!walletOpen)}
        >
          <div className="flex justify-between">
            <div>
              <p className="text-gray-300 flex items-center mb-1">
                <Wallet className="w-4 h-4 mr-2 text-yellow-400" /> Current
                Balance
              </p>
              <h2 className="text-3xl font-bold text-yellow-400">
                ₹{wallet.rupees}
              </h2>
              <p className="text-gray-400 text-sm">
                Pending: ₹{wallet.pendingRupees || 0}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-purple-300">Reward Coins</p>
              <div className="flex items-center justify-end space-x-2">
                <Coins className="w-6 h-6 text-purple-400" />
                <p className="text-2xl font-bold text-purple-400">
                  {wallet.coins.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Pending: {wallet.pendingCoins?.toLocaleString() || 0}
              </p>
            </div>

            {walletOpen ? (
              <ChevronUp className="text-yellow-400" />
            ) : (
              <ChevronDown className="text-yellow-400" />
            )}
          </div>

          {walletOpen && (
            <div className="mt-4 border-t border-gray-700 pt-4 max-h-40 overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between bg-gray-700 p-2 rounded mb-2 text-sm"
                >
                  <div>
                    <p
                      className={`${
                        tx.type === "Added"
                          ? "text-green-400"
                          : "text-red-400"
                      } font-bold`}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-gray-300">{tx.reason}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{tx.date}</span>
                </div>
              ))}
              <button
                onClick={handleWithdraw}
                className="w-full py-2 mt-2 bg-yellow-500 text-gray-900 rounded-xl font-bold hover:bg-yellow-400"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>

        {/* OFFERS SECTION */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-2">
          Exclusive Coin Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-800 rounded-xl shadow overflow-hidden flex flex-col hover:ring-2 hover:ring-yellow-500/50 transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={offer.img}
                  alt={offer.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white rounded-full px-2 flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-purple-400" />{" "}
                  {offer.cost.toLocaleString()}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">
                  {offer.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">{offer.desc}</p>
                <button
                  disabled={wallet.coins < offer.cost}
                  onClick={() => handleRedeem(offer)}
                  className={`mt-auto px-4 py-2 rounded-full font-semibold transition ${
                    wallet.coins >= offer.cost
                      ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {wallet.coins >= offer.cost ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-1" /> Redeem
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <XCircle className="w-5 h-5 mr-1" /> Need{" "}
                      {offer.cost - wallet.coins} Coins
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav ownerId={ownerId} cart={[]} />
    </div>
  );
}
